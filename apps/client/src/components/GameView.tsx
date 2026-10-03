import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { SocketController } from '@/store/socket-controller';
import { useGameStore } from '@/hooks/useGameStore';
import { PlayerView } from '@/components/PlayerView';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import EditPlayer from '@/components/edit-player';
import { GameSettingsDialog } from '@/components/game-settings-dialog';
import {
  Plus,
  RefreshCw,
  Copy,
  Check,
  Users,
  Eye,
  Crown,
  Sparkles,
  ArrowLeft,
  RotateCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import { useTranslation } from '@/i18n';

interface GameViewProps {
  sc: SocketController;
}

export const GameView = observer(({ sc }: GameViewProps) => {
  const { t } = useTranslation();
  const gameStore = useGameStore();
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const me = gameStore.me;
  const activePlayers = gameStore.activePlayers;
  const spectators = gameStore.spectators;
  const turnPlayer = gameStore.turnPlayer;

  // Prompt player to enter name if not set yet
  useEffect(() => {
    const savedName = localStorage.getItem('game-name');
    if (!savedName && (!me?.name || me.name.trim() === '')) {
      setEditOpen(true);
    }
  }, [me?.name]);

  const copyRoomLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(t('linkCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('copyFailed'));
    }
  };

  const getModeLabel = () => {
    switch (gameStore.settings.assignmentMode) {
      case 'neighbor_right':
        return t('modeRightTitle');
      case 'neighbor_left':
        return t('modeLeftTitle');
      case 'admin_only':
        return t('modeAdminTitle');
      default:
        return null;
    }
  };

  if (!me) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <p className="text-sm">{t('connecting')}</p>
        </div>
      </div>
    );
  }

  const modeBadge = getModeLabel();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" title={t('home')}>
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg hidden sm:inline">{t('appName')}</span>
              <button
                onClick={copyRoomLink}
                className="flex items-center gap-1.5 px-3 py-1 bg-muted hover:bg-muted/80 rounded-full text-xs font-mono text-muted-foreground hover:text-foreground transition-colors border border-border cursor-pointer"
                title={t('copyLink')}
              >
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                <span className="truncate max-w-[140px] sm:max-w-xs">{sc.socket.room}</span>
              </button>
            </div>
          </div>

          {/* Turn Banner / Mode Banner */}
          <div className="hidden md:flex items-center gap-2">
            {modeBadge && (
              <span className="px-2.5 py-0.5 rounded-full bg-muted text-xs text-muted-foreground border border-border">
                {modeBadge}
              </span>
            )}

            {activePlayers.length > 0 && turnPlayer && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                <Sparkles className="size-3.5 animate-pulse" />
                <span>
                  {t('currentTurn')}:{' '}
                  <strong className="font-semibold">
                    {turnPlayer.id === me.id ? t('yourTurn') : turnPlayer.displayName}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <GameSettingsDialog
              sc={sc}
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
            />
            <EditPlayer player={me} open={editOpen} onOpenChange={setEditOpen} sc={sc} />
            <Button
              onClick={() => sc.sendSync()}
              variant="outline"
              size="icon"
              title={t('syncState')}
            >
              <RefreshCw className="size-4" />
            </Button>
            <LanguageToggle />
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col items-center justify-center">
        {activePlayers.length === 0 ? (
          <div className="text-center max-w-md py-12 px-6 rounded-2xl border border-dashed border-border bg-card/40 space-y-4">
            <Users className="size-12 mx-auto text-muted-foreground/60" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{t('noPlayersYet')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('noPlayersDesc')}
              </p>
            </div>
            {me.isSpectator && (
              <Button onClick={() => sc.sendJoin()} className="w-full sm:w-auto font-medium">
                <Plus className="size-4 mr-2" /> {t('joinGame')}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-stretch justify-center gap-6 w-full">
            {activePlayers.map((player) => (
              <PlayerView
                key={player.id}
                me={me}
                isTurn={gameStore.turnPlayerId === player.id}
                player={player}
                sc={sc}
              />
            ))}

            {/* Spectator "Join" CTA Tile */}
            {me.isSpectator && (
              <button
                onClick={() => sc.sendJoin()}
                className="flex flex-col items-center justify-center gap-3 w-56 min-h-[320px] rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all text-primary font-medium hover:border-primary p-6 cursor-pointer"
              >
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="size-6" />
                </div>
                <span>{t('joinGame')}</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer / Spectators Bar */}
      <footer className="border-t border-border bg-card/40 backdrop-blur-sm px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Eye className="size-4" />
            <span className="font-medium">{t('spectators')} ({spectators.length}):</span>
            {spectators.length === 0 ? (
              <span>{t('spectatorsNone')}</span>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                {spectators.map((s) => (
                  <span
                    key={s.id}
                    className="px-2 py-0.5 rounded bg-muted text-foreground font-medium text-[11px]"
                  >
                    {s.displayName} {s.id === me.id && `(${t('you')})`}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <RotateCw className="size-3 text-primary" /> {t('circleCounter')}: {gameStore.round + 1}
            </span>
            {me.isAdmin && (
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <Crown className="size-3" /> {t('adminBadge')}
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
});