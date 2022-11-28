import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {SignalrService} from "../services/signalr.service";
import {RtcService} from "../services/rtc.service";
import {ChatMessage, PeerData, SignalInfo, UserInfo} from "../models/peerData.interface";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-webcam',
  templateUrl: './signalr.component.html'
})
export class SignalrComponent implements  OnInit, OnDestroy{

  @ViewChild('otherVideoPlayer') otherVideoPlayer!: ElementRef;
  @ViewChild('ourVideoPlayer') ourVideoPlayer!: ElementRef;

  public subscriptions = new Subscription();

  private stream!: MediaStream;

  public currentUser!: string;

  public dataString!: string;

  public userVideo!: string;

  public otherUser!: UserInfo;

  public mediaError = (): void => { console.error(`Can't get user media`); };

  constructor(private rtcService: RtcService, private signalR: SignalrService) { }

  ngOnInit() {

    this.subscriptions.add(this.signalR.newPeer$.subscribe((user: UserInfo) => {
      this.rtcService.newUser(user);
      this.signalR.sayHello(this.currentUser, user.connectionId);
      console.log(user.userName);
      if (!this.otherUser)
      {
        this.otherUser = user;
      }
    }));

    this.subscriptions.add(this.signalR.helloAnswer$.subscribe((user: UserInfo) => {
      if (!this.otherUser)
      {
        this.otherUser = user;
      }
      this.rtcService.newUser(user);
    }));

    this.subscriptions.add(this.signalR.disconnectedPeer$.subscribe((user: UserInfo) => {
      this.rtcService.disconnectedUser(user);
    }));

    this.subscriptions.add(this.signalR.signal$.subscribe((signalData: SignalInfo) => {
      this.rtcService.signalPeer(signalData.user, signalData.signal, this.stream);
    }));

    this.subscriptions.add(this.rtcService.onSignalToSend$.subscribe((data: PeerData) => {
      this.signalR.sendSignalToUser(data.data, data.id);
    }));

    this.subscriptions.add(this.rtcService.onStream$.subscribe((data: PeerData) => {
      this.userVideo = data.id;
      this.otherVideoPlayer.nativeElement.srcObject = data.data;
      this.otherVideoPlayer.nativeElement.load();
      this.otherVideoPlayer.nativeElement.play();
    }));
  }

  public onUserSelected(userInfo: UserInfo) {
    const peer = this.rtcService.createPeer(this.stream, userInfo.connectionId, true);
    this.rtcService.currentPeer = peer;
  }

  public async saveUsername(): Promise<void> {
    try {
      await this.signalR.startConnection(this.currentUser);
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.ourVideoPlayer.nativeElement.srcObject = this.stream;
      this.ourVideoPlayer.nativeElement.playsInline = true;
      this.ourVideoPlayer.nativeElement.muted = true;
      this.ourVideoPlayer.nativeElement.load();
      this.ourVideoPlayer.nativeElement.play();
    } catch (error) {
      console.error(`Can't join room, error ${error}`);
    }
  }

  public async saveUsernameOnMobile(): Promise<void> {
    try {
      await this.signalR.startConnection(this.currentUser);
    } catch (error) {
      console.error(`Can't join room, error ${error}`);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
