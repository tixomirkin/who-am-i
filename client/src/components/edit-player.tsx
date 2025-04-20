import {Player} from "@/store/game.ts";

import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button.tsx";
import {UserRoundPen} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import {SocketController} from "@/store/socket-controller.ts";
import {useNavigate} from "@tanstack/react-router";

type EditPlayerProps = {
    player: Player;
    open: boolean;
    onOpenChange(open: boolean): void;
    sc: SocketController
}

export default function EditPlayer({player, open, onOpenChange, sc}: EditPlayerProps) {

    const [name, setName] = useState("");
    const navigate = useNavigate({ from: '/$roomId' })

    useEffect(() => {
        // const oldName = localStorage.getItem("game-name")
        // if (oldName) setName(oldName);
        // else setName('');
        setName(player.name);
    }, [open]);

    const editName = () => {
        if (name == '') {
            toast.info("Введите имя")
            return
        }
        sc.sendMyName(name)
        localStorage.setItem('game-name', name)
        onOpenChange(false)
    }

    const resetSocket = () => {
        localStorage.removeItem('socket_id');
        navigate({to: '/'})
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger><Button variant='outline' size='icon'><UserRoundPen/></Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Редактирование профиля</DialogTitle>
                    <DialogDescription className='mb-3'>
                        Ваше имя и аватар будет отображаться другим игрокам.
                    </DialogDescription>
                </DialogHeader>

                <Label htmlFor='name'>Ваше имя</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} id='name'/>

                <Label htmlFor='file'>Загрузка аватара</Label>
                <Input disabled type='file' id='file'/>

                <DialogDescription className=''>
                    Загрузка аватара пока недоступна.<br/>
                    Если у вас возникают проблемы с подключением, вы можете попробовать сбросить socket-id.<br/>
                    socket-id: {sc.socket.id}
                </DialogDescription>

                <DialogFooter>
                    <Button variant='ghost' onClick={resetSocket} className='mr-auto'>Сбросить socket-id</Button>
                    <Button variant='default' onClick={editName}>Сохранить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )


}