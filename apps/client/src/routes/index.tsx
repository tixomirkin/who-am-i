import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
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
import { Sparkles, ArrowRight, Gamepad2 } from 'lucide-react';
import { validateRoomId } from '@who-am-i/shared';

export const Route = createFileRoute('/')({
  component: LandingRouteComponent,
});

function LandingRouteComponent() {
  const navigate = useNavigate({ from: '/' });
  const [inputRoomId, setInputRoomId] = useState('');

  const handleEnterRoom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = inputRoomId.trim();
    // Allow pasting full URL as room ID
    const extractedId = trimmed.includes('/') ? trimmed.split('/').pop() || '' : trimmed;

    const validation = validateRoomId(extractedId);
    if (!validation.valid) {
      toast.error(validation.error || 'Пожалуйста, введите корректный ID комнаты');
      return;
    }

    navigate({ to: '/$roomId', params: { roomId: extractedId } });
  };

  const handleCreateRoom = () => {
    const roomId = uuidv4();
    toast.success('Комната создана!');
    navigate({ to: '/$roomId', params: { roomId } });
  };

  return (
    <main className="bg-background min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/80">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
            <Gamepad2 className="size-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Who am I?</CardTitle>
          <CardDescription className="text-sm">
            Онлайн-игра в угадайку для компании друзей. Угадай своего персонажа по подсказкам!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form onSubmit={handleEnterRoom} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="roomId" className="text-xs font-medium">
                Код или ссылка на комнату
              </Label>
              <Input
                id="roomId"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                placeholder="Вставьте код или ссылку..."
                className="font-mono text-sm"
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full">
              Войти в комнату <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </form>

          <div className="relative text-center text-xs uppercase text-muted-foreground after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-card px-2">или</span>
          </div>

          <Button
            className="w-full font-medium"
            onClick={handleCreateRoom}
          >
            <Sparkles className="size-4 mr-2" /> Создать новую комнату
          </Button>
        </CardContent>

        <CardFooter className="pt-2 flex items-center justify-between border-t border-border/60 text-xs text-muted-foreground">
          <span>Сделано с ❤️ для Discord</span>
          <ModeToggle />
        </CardFooter>
      </Card>
    </main>
  );
}
