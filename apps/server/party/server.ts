import type * as Party from 'partykit/server';
import { RoomStateManager } from './room-state';
import { GameEventDispatcher } from './event-dispatcher';
import { ImgurMediaService, type IMediaService } from './media-service';

export default class Server implements Party.Server {
  private readonly roomState: RoomStateManager;
  private readonly dispatcher: GameEventDispatcher;
  private readonly mediaService: IMediaService;

  constructor(readonly room: Party.Room) {
    this.roomState = new RoomStateManager();
    this.dispatcher = new GameEventDispatcher(this.roomState, this.room);
    this.mediaService = new ImgurMediaService();
  }

  async onRequest(req: Party.Request): Promise<Response> {
    return this.mediaService.handleRequest(req);
  }

  onConnect(conn: Party.Connection): void {
    this.dispatcher.handleConnection(conn);
  }

  onClose(conn: Party.Connection): void {
    this.dispatcher.handleDisconnect(conn);
  }

  async onMessage(message: string, sender: Party.Connection): Promise<void> {
    await this.dispatcher.dispatch(message, sender);
  }
}

Server satisfies Party.Worker;
