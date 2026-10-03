import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { Player } from '@/store/game';
import type { SocketController } from '@/store/socket-controller';
import { useDebounce } from 'use-debounce';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Crown, Play, LogOut, HelpCircle } from 'lucide-react';

interface PlayerViewProps {
  player: Player;
  me: Player;
  isTurn: boolean;
  sc: SocketController;
}

export const PlayerView = observer(({ me, isTurn, player, sc }: PlayerViewProps) => {
  const isMe = me.id === player.id;
  const [gameName, setGameName] = useState<string>(player.gameName);
  const [debouncedGameName] = useDebounce(gameName, 300);

  // Sync with store updates if another player changed the gameName
  useEffect(() => {
    setGameName(player.gameName);
  }, [player.gameName]);

  // Send debounced update to room
  useEffect(() => {
    if (!isMe && !me.isSpectator && debouncedGameName !== player.gameName) {
      sc.sendEditGameName(player.id, debouncedGameName);
    }
  }, [debouncedGameName, player.id, isMe, me.isSpectator, player.gameName, sc]);

  return (
    <div
      className={`relative flex flex-col w-56 rounded-2xl overflow-hidden bg-card border transition-all duration-300 ${
        isTurn
          ? 'border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/10 scale-[1.02]'
          : 'border-border shadow-sm hover:shadow-md'
      }`}
    >
      {/* Header / Avatar Area */}
      <div className="relative w-full h-44 bg-muted flex items-center justify-center overflow-hidden">
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
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1 shadow">
            <Play className="size-3 fill-current" /> Ход
          </div>
        )}

        {/* Admin Crown Badge */}
        {player.isAdmin && (
          <div
            className="absolute top-2 right-2 p-1.5 rounded-full bg-amber-500/90 text-white shadow"
            title="Администратор комнаты"
          >
            <Crown className="size-3.5" />
          </div>
        )}

        {/* Switch to spectator button for self */}
        {isMe && !me.isSpectator && (
          <button
            onClick={() => sc.sendSpectator()}
            title="Перейти в зрители"
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-destructive hover:text-white backdrop-blur-sm text-muted-foreground transition-colors shadow"
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
            {player.displayName} {isMe && <span className="text-xs text-muted-foreground font-normal">(Вы)</span>}
          </h3>
        </div>

        {/* Character Guess Area */}
        <div className="flex-1 flex flex-col justify-end">
          {isMe ? (
            <div className="flex flex-col gap-2">
              <div className="h-16 rounded-lg bg-muted/60 border border-dashed border-border flex items-center justify-center text-center p-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <HelpCircle className="size-4 text-primary" />
                  <span>Ваш персонаж скрыт</span>
                </div>
              </div>

              {isTurn ? (
                <Button
                  size="sm"
                  className="w-full font-medium"
                  onClick={() => sc.sendEndTurn()}
                >
                  Завершить ход
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground block text-left">
                Загаданный персонаж
              </label>
              <Textarea
                className="resize-none h-16 text-sm text-center leading-snug rounded-lg"
                disabled={me.isSpectator}
                value={gameName}
                placeholder={me.isSpectator ? 'Только для игроков' : 'Загадайте персонажа...'}
                maxLength={50}
                onChange={(e) => setGameName(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});