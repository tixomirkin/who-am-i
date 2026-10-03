import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, User } from 'lucide-react';
import { validateRoomId } from '@who-am-i/shared';
import { useTranslation } from '@/i18n';
import icon from '@/assets/favicon.svg';

export const Route = createFileRoute('/')({
  component: LandingRouteComponent,
});

function LandingRouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate({ from: '/' });
  const [inputRoomId, setInputRoomId] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('game-name') || '';
    setNickname(saved);
  }, []);

  const handleNicknameChange = (val: string) => {
    setNickname(val);
    localStorage.setItem('game-name', val.trim());
  };

  const handleEnterRoom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = inputRoomId.trim();
    const extractedId = trimmed.includes('/') ? trimmed.split('/').pop() || '' : trimmed;

    const validation = validateRoomId(extractedId);
    if (!validation.valid) {
      toast.error(t('invalidRoomId'));
      return;
    }

    navigate({ to: '/$roomId', params: { roomId: extractedId } });
  };

  const handleCreateRoom = () => {
    const roomId = uuidv4();
    toast.success(t('roomCreated'));
    navigate({ to: '/$roomId', params: { roomId } });
  };

  return (
    <main className="bg-background min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/80">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1 p-2">
            <img src={icon} alt="Logo" className="size-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">{t('appName')}</CardTitle>
          <CardDescription className="text-sm">
            {t('tagline')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Nickname Input */}
          <div className="space-y-1.5">
            <Label htmlFor="nickname" className="text-xs font-medium flex items-center gap-1.5">
              <User className="size-3.5 text-primary" /> {t('nicknameOptional')}
            </Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              placeholder={t('nicknamePlaceholder')}
              maxLength={50}
              className="text-sm"
            />
          </div>

          <form onSubmit={handleEnterRoom} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="roomId" className="text-xs font-medium">
                {t('roomCodeOrUrl')}
              </Label>
              <Input
                id="roomId"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                placeholder={t('roomCodePlaceholder')}
                className="font-mono text-sm"
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full font-medium">
              {t('enterRoom')} <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </form>

          <div className="relative text-center text-xs uppercase text-muted-foreground after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-card px-2">{t('or')}</span>
          </div>

          <Button
            className="w-full font-medium"
            onClick={handleCreateRoom}
          >
            <Sparkles className="size-4 mr-2" /> {t('createRoom')}
          </Button>
        </CardContent>

        <CardFooter className="pt-3 flex items-center justify-between border-t border-border/60 text-xs text-muted-foreground">
          <span>{t('madeWithLove')}</span>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ModeToggle />
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
