import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Sliders,
  Volume2,
  ShieldAlert,
} from 'lucide-react';
import type { ModelStatus, HealthStatus } from '../types';
import { api } from '../services/api';
import { soundService } from '../services/audio';

interface Props {
  modelStatus: ModelStatus | null;
  onRefreshModel: () => void;
}

export const Settings: React.FC<Props> = ({ modelStatus, onRefreshModel }) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [audioActive, setAudioActive] = useState(soundService.getStatus());
  const [pingSuccess, setPingSuccess] = useState<boolean | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const data = await api.getHealth();
      setHealth(data);
      setPingSuccess(true);
    } catch {
      setPingSuccess(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadHealth() {
      try {
        const data = await api.getHealth();
        if (!ignore) {
          setHealth(data);
          setPingSuccess(true);
        }
      } catch {
        if (!ignore) {
          setPingSuccess(false);
        }
      }
    }

    loadHealth();
    return () => {
      ignore = true;
    };
  }, []);

  const handleLoadModel = async () => {
    try {
      setLoadingAction(true);
      await api.loadModel();
      setTimeout(onRefreshModel, 1500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to trigger model load');
    } finally {
      setLoadingAction(false);
      onRefreshModel();
    }
  };

  const toggleAudio = () => {
    const active = soundService.toggleMute();
    setAudioActive(active);
  };

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-[#F5F3FF]">
      {/* Page Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#39E6B0] mb-1">
          <Sliders className="w-4 h-4 text-[#A78BFA]" />
          <span>System Diagnostics // Machine Specs</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F3FF] tracking-wide">
          Machine Specifications
        </h1>
        <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1 font-serif italic">
          Inspect open-weight model weights, memory allocation, execution device, and deployment parameters.
        </p>
      </div>

      <div className="space-y-6">
        {/* Model Architecture & Weights Card */}
        <div className="bg-[#11131B] border border-[#171923] rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#171923] mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#39E6B0]" />
              <h2 className="text-lg font-serif font-bold text-[#F5F3FF]">
                Open-Weight AI Model
              </h2>
            </div>
            <button
              onClick={() => {
                onRefreshModel();
                fetchHealth();
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#171923] text-[#9CA3AF] hover:text-[#F5F3FF] border border-[#171923] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#171923]/60 p-3.5 rounded-lg border border-[#171923]">
              <span className="text-[10px] font-mono uppercase text-[#9CA3AF] block mb-1">Model Repository</span>
              <p className="font-mono text-xs text-[#F5F3FF] font-semibold truncate">
                {modelStatus?.model_id || 'Qwen/Qwen2.5-3B-Instruct'}
              </p>
              <span className="text-[10px] text-[#39E6B0]">Apache 2.0 License</span>
            </div>

            <div className="bg-[#171923]/60 p-3.5 rounded-lg border border-[#171923]">
              <span className="text-[10px] font-mono uppercase text-[#9CA3AF] block mb-1">Inference Device</span>
              <p className="font-mono text-xs text-[#F5F3FF] font-semibold uppercase">
                {modelStatus?.device || 'cpu'}
              </p>
              <span className="text-[10px] text-[#9CA3AF]">
                {modelStatus?.device === 'cuda' ? 'GPU Acceleration' : 'Direct CPU Engine'}
              </span>
            </div>

            <div className="bg-[#171923]/60 p-3.5 rounded-lg border border-[#171923]">
              <span className="text-[10px] font-mono uppercase text-[#9CA3AF] block mb-1">Weight Status</span>
              <p className="font-mono text-xs font-semibold capitalize flex items-center gap-1.5">
                {modelStatus?.status === 'ready' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#39E6B0]" />
                    <span className="text-[#39E6B0]">Ready (Loaded)</span>
                  </>
                ) : modelStatus?.status === 'loading' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[#A78BFA] animate-spin" />
                    <span className="text-[#A78BFA]">Loading...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D97757]" />
                    <span className="text-[#D97757]">Unloaded</span>
                  </>
                )}
              </p>
              <span className="text-[10px] text-[#9CA3AF]">Hugging Face Transformers</span>
            </div>

            <div className="bg-[#171923]/60 p-3.5 rounded-lg border border-[#171923]">
              <span className="text-[10px] font-mono uppercase text-[#9CA3AF] block mb-1">Precision (Dtype)</span>
              <p className="font-mono text-xs text-[#F5F3FF] font-semibold">
                {modelStatus?.dtype || 'torch.float32'}
              </p>
              <span className="text-[10px] text-[#9CA3AF]">Max Tokens: {modelStatus?.max_new_tokens || 700}</span>
            </div>
          </div>

          {/* Model Weights Load Action Button */}
          {modelStatus?.status !== 'ready' && (
            <div className="p-4 bg-[#171923]/80 rounded-xl border border-[#A78BFA]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#F5F3FF]">Model weights are currently in standby</p>
                <p className="text-[11px] text-[#9CA3AF]">
                  To conserve memory on free cloud tiers, weights can be initialized on demand.
                </p>
              </div>
              <button
                onClick={handleLoadModel}
                disabled={loadingAction || modelStatus?.status === 'loading'}
                className="px-4 py-2 rounded-lg bg-[#A78BFA] text-[#08090D] font-serif font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                {loadingAction || modelStatus?.status === 'loading' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading Weights...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Initialize Model into RAM</span>
                  </>
                )}
              </button>
            </div>
          )}

          {modelStatus?.error_message && (
            <div className="mt-4 p-3 bg-[#D97757]/15 border border-[#D97757]/30 rounded-lg text-xs text-[#D97757] font-mono">
              <strong>Error Trace:</strong> {modelStatus.error_message}
            </div>
          )}
        </div>

        {/* System Memory & Database Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Memory Card */}
          <div className="bg-[#11131B] border border-[#171923] rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#171923]">
              <HardDrive className="w-4 h-4 text-[#39E6B0]" />
              <h3 className="font-serif font-bold text-sm text-[#F5F3FF]">System Memory Allocation</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#171923]/50">
                <span className="text-[#9CA3AF]">Total Physical RAM:</span>
                <span className="font-mono text-[#F5F3FF]">{modelStatus?.memory_info?.system_total_gb || '--'} GB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#171923]/50">
                <span className="text-[#9CA3AF]">Available RAM:</span>
                <span className="font-mono text-[#39E6B0]">{modelStatus?.memory_info?.system_available_gb || '--'} GB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#171923]/50">
                <span className="text-[#9CA3AF]">RAM Utilization:</span>
                <span className="font-mono text-[#F5F3FF]">{modelStatus?.memory_info?.system_used_percent || '--'}%</span>
              </div>
              {modelStatus?.memory_info?.gpu_name && (
                <div className="flex justify-between py-1 border-b border-[#171923]/50">
                  <span className="text-[#9CA3AF]">GPU Model:</span>
                  <span className="font-mono text-[#39E6B0]">{modelStatus.memory_info.gpu_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Database & API Health Card */}
          <div className="bg-[#11131B] border border-[#171923] rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#171923]">
              <Activity className="w-4 h-4 text-[#A78BFA]" />
              <h3 className="font-serif font-bold text-sm text-[#F5F3FF]">Backend Health & Storage</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#171923]/50">
                <span className="text-[#9CA3AF]">API Status:</span>
                <span className="font-mono text-[#39E6B0] capitalize">{health?.status || (pingSuccess ? 'Healthy' : 'Disconnected')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#171923]/50">
                <span className="text-[#9CA3AF]">Database Engine:</span>
                <span className="font-mono text-[#F5F3FF]">SQLite (digital_seance.db)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#171923]/50">
                <span className="text-[#9CA3AF]">Database Connection:</span>
                <span className="font-mono text-[#39E6B0] capitalize">{health?.database || 'Connected'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#171923]/50">
                <span className="text-[#9CA3AF]">Version:</span>
                <span className="font-mono text-[#F5F3FF]">v{health?.version || '1.0.0'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Ambience Settings */}
        <div className="bg-[#11131B] border border-[#171923] rounded-xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#A78BFA]" />
              <h3 className="font-serif font-bold text-sm text-[#F5F3FF]">Supernatural Audio Ambiance</h3>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1">
              Synthesizes procedural low-frequency harmonic drone chords (Web Audio API) to enhance the séance immersion.
            </p>
          </div>
          <button
            onClick={toggleAudio}
            className={`px-4 py-2 rounded-lg text-xs font-serif font-bold uppercase tracking-wider transition-all border ${
              audioActive
                ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-[#A78BFA]'
                : 'bg-[#171923] border-[#171923] text-[#9CA3AF] hover:text-[#F5F3FF]'
            }`}
          >
            {audioActive ? 'Active (Drone On)' : 'Muted (Silent)'}
          </button>
        </div>

        {/* Deployment Reality Guide Card */}
        <div className="bg-[#11131B] border border-[#171923] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#D97757]">
            <ShieldAlert className="w-4 h-4" />
            <span>Deployment Reality Notice</span>
          </div>
          <h3 className="text-lg font-serif font-bold text-[#F5F3FF]">
            Local Execution vs. Render Cloud Deployment
          </h3>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            Running <strong>Qwen2.5-3B-Instruct</strong> requires ~3.5 GB of RAM (in float16/bfloat16) or ~6.5 GB (in float32).
            Render's free tier provides 512 MB RAM, which is insufficient to hold the full 3B model in memory.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans pt-2">
            <div className="p-4 bg-[#171923] rounded-lg border border-[#171923]">
              <p className="font-bold text-[#39E6B0] mb-1 font-mono">1. Local Execution (Recommended)</p>
              <p className="text-[#9CA3AF] leading-snug">
                Clone the repository to a desktop/laptop with 8GB+ RAM or any modern GPU. Run backend with <code>uvicorn app.main:app</code>. Full model inference will execute natively with zero compromises.
              </p>
            </div>
            <div className="p-4 bg-[#171923] rounded-lg border border-[#171923]">
              <p className="font-bold text-[#A78BFA] mb-1 font-mono">2. Scaled Render Instance</p>
              <p className="text-[#9CA3AF] leading-snug">
                For cloud deployment, configure Render with a Starter or Standard instance (2GB - 4GB RAM) or set <code>MODEL_ID=Qwen/Qwen2.5-0.5B-Instruct</code> for lightweight testing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
