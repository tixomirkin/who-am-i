import { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import type { Player } from '@/store/game';
import type { SocketController } from '@/store/socket-controller';
import { useGameStore } from '@/hooks/useGameStore';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Crown, Play, LogOut, HelpCircle, Lock } from 'lucide-react';
import { canAssignCharacter } from '@who-am-i/shared';
import { useTranslation } from '@/i18n';

interface PlayerViewProps {
  player: Player;
  me: Player;
  isTurn: boolean;
  sc: SocketController;
}

export const PlayerView = observer(({ me, isTurn, player, sc }: PlayerViewProps) => {
  const { t } = useTranslation();
  const gameStore = useGameStore();
  const isMe = me.id === player.id;
  const canEdit = gameStore.canEditCharacterFor(player.id);

  const [localGameName, setLocalGameName] = useState<string>(player.gameName);
  const isFocusedRef = useRef(false);

  // Sync local text when store updates from other players (if user isn't actively typing)
  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalGameName(player.gameName);
    }
  }, [player.gameName]);

  const handleTextChange = (value: string) => {
    setLocalGameName(value);
    sc.sendEditGameName(player.id, value);
  };

  const getPlaceholderText = () => {
    if (isMe) return t('mysteryCardHidden');
    if (!canEdit) {
      const mode = gameStore.settings.assignmentMode;
      if (mode === 'admin_only') return t('assignedByAdmin');
      if (mode === 'neighbor_right' || mode === 'neighbor_left') {
        const author = gameStore.activePlayers.find((activeP) =>
          canAssignCharacter(activeP.id, player.id, gameStore.toGameState())
        );
        return author ? t('assignedByAuthor', { name: author.displayName }) : t('lockedEditing');
      }
      return t('onlyPlayersCanEdit');
    }
    return player.gameName ? player.gameName : t('characterPlaceholder');
  };

  return (
    <div
      className={`relative flex flex-col w-full max-w-[280px] xs:w-52 sm:w-56 rounded-2xl overflow-hidden bg-card border transition-all duration-300 ${
        isTurn
          ? 'border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/10 scale-[1.02]'
          : 'border-border shadow-sm hover:shadow-md'
      }`}
    >
      {/* Header / Avatar Area */}
      <div className="relative w-full h-40 sm:h-44 bg-muted flex items-center justify-center overflow-hidden">
        {player.avatar ? (
          <img
            src={player.avatar}
            alt={player.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <span className="text-3xl font-bold">{player.initials}</span>
          </div>
        )}

        {/* Turn Status Overlay Badge */}
        {isTurn && (
          <div className="absolute top-2 left-2 p-1.5  rounded-full bg-primary text-primary-foreground  shadow">
            <Play className="size-3.5 fill-current" />
          </div>
        )}

        {/* Admin Crown Badge */}
        {player.isAdmin && (
          <div
            className="absolute top-2 right-2 p-1.5 rounded-full bg-amber-500/90 text-white shadow"
            title={t('adminBadge')}
          >
            <Crown className="size-3.5" />
          </div>
        )}

        {/* Switch to spectator button for self */}
        {isMe && !me.isSpectator && (
          <button
            onClick={() => sc.sendSpectator()}
            title={t('switchToSpectator')}
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-destructive hover:text-white backdrop-blur-sm text-muted-foreground transition-colors shadow cursor-pointer"
          >
            <LogOut className="size-3.5" />
          </button>
        )}
      </div>

      {/* Body Area */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        {/* Player Name */}
        <div className="text-center">
          <h3
            className={`font-semibold text-base truncate ${
              isMe ? 'text-primary font-bold' : 'text-foreground'
            }`}
            title={player.displayName}
          >
            {player.displayName} {isMe && <span className="text-xs text-muted-foreground font-normal">({t('you')})</span>}
          </h3>
        </div>

        {/* Character Guess Area */}
        <div className="flex-1 flex flex-col justify-end">
          {isMe ? (
            <div className="flex flex-col gap-2">
              <div className="h-16 rounded-lg bg-muted/60 border border-dashed border-border flex items-center justify-center text-center p-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <HelpCircle className="size-4 text-primary" />
                  <span>{t('mysteryCardHidden')}</span>
                </div>
              </div>

              {isTurn ? (
                <Button
                  size="sm"
                  className="w-full font-medium"
                  onClick={() => sc.sendEndTurn()}
                >
                  {t('finishTurn')}
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground block text-left">
                  {t('targetCharacter')}
                </label>
                {!canEdit && (
                  <span title={t('lockedEditing')}>
                    <Lock className="size-3 text-muted-foreground/60" />
                  </span>
                )}
              </div>
              <Textarea
                className={`resize-none h-16 text-sm text-center leading-snug rounded-lg transition-colors ${
                  !canEdit ? 'bg-muted/50 cursor-not-allowed opacity-80' : ''
                }`}
                disabled={!canEdit}
                value={canEdit ? localGameName : player.gameName}
                placeholder={getPlaceholderText()}
                maxLength={50}
                onFocus={() => {
                  isFocusedRef.current = true;
                }}
                onBlur={() => {
                  isFocusedRef.current = false;
                }}
                onChange={(e) => handleTextChange(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});