import {createFileRoute, useNavigate} from '@tanstack/react-router'
import {Button} from "@/components/ui/button.tsx";
import {ModeToggle} from "@/components/mode-toggle.tsx";
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from "@/components/ui/card.tsx";
import {Input} from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label"
import {v4 as uuidv4} from "uuid";
import { toast } from "sonner"
import {useState} from "react";
import * as url from "node:url";

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {

  const navigate = useNavigate({ from: '/' })
  const [inputRoomId, setInputRoomId] = useState('')

  const enterRoom = () => {
    if (inputRoomId == '') {
      toast.info("Введите id комнаты")
      return
    }

    if (inputRoomId.length < 5) {
      toast.info("Длина id комнаты должна быть больше 5")
      return
    }

    navigate({to: '/$roomId', params: {roomId: inputRoomId}})
  }

  const createRoom = () => {
    const roomId = uuidv4()
    navigate({to: '/$roomId', params: {roomId}})
  }

  return <main
      // style={{backgroundImage: url('https://imgur.com/a/GBplGFr')}}
      className='bg-background w-full h-screen flex transition-colors justify-center items-center p-5'>
    <Card className='w-100'>
      <CardHeader>
        <CardTitle>Who am I?</CardTitle>
        <CardDescription>Добро пожаловать! Войдите в игру</CardDescription>
      </CardHeader>
      <CardContent>

        <div className='mb-4'>
          <Label className='mb-1.5' htmlFor="roomId">Код комнаты</Label>
          <Input value={inputRoomId} onChange={(e) => setInputRoomId(e.target.value)} required className='mb-1.5' id='roomId' placeholder='30c39840-1e05-11f0-993a-7da87b1aef53'/>
          <Button onClick={enterRoom} variant='secondary' className='w-full'>Войти в комнату</Button>
        </div>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border mb-4">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  Или создайте свою
                </span>
        </div>

        <Button className='w-full' onClick={createRoom}>Создать комнату</Button>

      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <p>Made by @tixomirkin</p>
          <ModeToggle/>
        </div>
      </CardFooter>
    </Card>

  </main>
}
