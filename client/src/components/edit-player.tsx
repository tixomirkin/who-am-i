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
import {LoaderCircle, UserRoundPen} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useEffect, useRef, useState} from "react";
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
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate({ from: '/$roomId' })
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setName(player.name);
    }, [open]);

    const editName = async () => {
        if (name == '') {
            toast.info("Введите имя")
            return
        }
        if (fileRef.current?.files && fileRef.current.files[0]) {
            const typeFile = fileRef.current?.files[0].type
            if (typeFile != 'image/jpeg' && typeFile != 'image/png') {
                toast.info("Поддерживается только загрузка png и jpeg ")
                return
            }

            const formData = new FormData();
            formData.append('file', fileRef.current?.files[0]);
            setIsUploading(true);
            try {
                const link = await sc.uploadImg(formData)
                sc.sendMyAvatar(link)
                localStorage.setItem('game-avatar', link)
            } catch (error) {
                // @ts-ignore
                toast.error(error)
            } finally {
                setIsUploading(false);
            }

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
            <DialogTrigger asChild><Button variant='outline' size='icon'><UserRoundPen/></Button></DialogTrigger>
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
                <Input ref={fileRef} type='file' id='file'/>

                <DialogDescription className=''>
                    Если у вас возникают проблемы с подключением, вы можете попробовать сбросить socket-id.<br/>
                    socket-id: {sc.socket.id}
                </DialogDescription>

                <DialogFooter>
                    <Button variant='ghost' onClick={resetSocket} className='mr-auto'>Сбросить socket-id</Button>
                    <Button variant='default' disabled={isUploading} onClick={editName}>{isUploading ? <><LoaderCircle className='animate-spin'/> Сохранение</> : 'Сохранить'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )


}