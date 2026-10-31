import React, { useState } from 'react';
import type { ModelStatus } from '../types';
import { Cpu, AlertTriangle, CheckCircle, RefreshCw, Info, ChevronDown, ChevronUp, Server } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  status: ModelStatus | null;
  onRefresh: () => void;
}

export const ModelStatusBanner: React.FC<Props> = ({ status, onRefresh }) => {
  const [loadingAction, setLoadingAction] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!status) return null;

  const handleLoadModel = async () => {
    try {
      setLoadingAction(true);
      await api.loadModel();
      setTimeout(onRefresh, 1200);
    } catch {
      // Ignored, refreshed anyway
    } finally {
      setLoadingAction(false);
      onRefresh();
    }
  };

  const getStatusBadge = () => {
    switch (status.status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#39E6B0]/15 text-[#39E6B0] border border-[#39E6B0]/30 shadow-sm shadow-[#39E6B0]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39E6B0] animate-ping" />
            Model Ready ({status.device})
          </span>
        );
      case 'loading':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Loading Weights...
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D97757]/20 text-[#D97757] border border-[#D97757]/30">
            <AlertTriangle className="w-3 h-3" />
            Model Unavailable
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#9CA3AF]/15 text-[#9CA3AF] border border-[#9CA3AF]/25">
            <Cpu className="w-3 h-3" />
            Weights Standby (Unloaded)
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#11131B]/95 border-b border-[#171923] text-sm py-2 px-4 backdrop-blur-md z-40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
            <Server className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span className="font-mono text-[#F5F3FF]">{status.model_id}</span>
          </div>

          {getStatusBadge()}

          {status.status === 'ready' && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#39E6B0]/80">
              <CheckCircle className="w-3 h-3" />
              Real open-weight inference enabled
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {status.status === 'unloaded' && (
            <button
              onClick={handleLoadModel}
              disabled={loadingAction}
              className="text-xs px-3 py-1 bg-[#A78BFA]/20 hover:bg-[#A78BFA]/30 text-[#A78BFA] border border-[#A78BFA]/40 rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {loadingAction ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Cpu className="w-3 h-3" />}
              Initialize Weights
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#9CA3AF] hover:text-[#F5F3FF] flex items-center gap-1 px-2 py-1 rounded hover:bg-[#171923] transition-colors"
            title="Deployment & Resource Details"
          >
            <Info className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Architecture Info</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-[#171923] text-xs text-[#9CA3AF] space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#171923]/60 p-3 rounded border border-[#171923]">
            <div>
              <p className="font-semibold text-[#F5F3FF] mb-1 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-[#39E6B0]" /> Open-Weight Model Reality
              </p>
              <p>
                Inference runs through Hugging Face <code className="text-[#39E6B0]">transformers</code> on {status.device.toUpperCase()}.
                No closed commercial APIs (OpenAI, Gemini, Claude) are ever utilized.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#F5F3FF] mb-1 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-[#A78BFA]" /> Memory & System Resources
              </p>
              <p>
                {status.memory_info?.system_available_gb ? (
                  <>Available RAM: <span className="text-[#F5F3FF]">{status.memory_info.system_available_gb} GB</span> / Total: {status.memory_info.system_total_gb} GB</>
                ) : (
                  'System memory reported by backend'
                )}
                {status.memory_info?.gpu_name && (
                  <span className="block text-[#39E6B0] mt-0.5">GPU: {status.memory_info.gpu_name}</span>
                )}
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#F5F3FF] mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D97757]" /> Free-Tier Cloud Deployments
              </p>
              <p>
                If running on Render's 512MB free tier, Qwen2.5-3B weights cannot fit into RAM.
                The app will display honest unavailability rather than fake AI text.
              </p>
            </div>
          </div>
          {status.error_message && (
            <div className="p-2 bg-[#D97757]/10 border border-[#D97757]/30 rounded text-[#D97757] font-mono text-[11px]">
              <strong>Backend Notice:</strong> {status.error_message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
