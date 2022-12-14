using System.Text.Json;
using Microsoft.AspNetCore.SignalR;

namespace WebCam;

public class SignalRtcHub: Hub
{
    public async Task NewUser(string name)
    {
        var userInfo = new UserInfo {userName = name, connectionId = Context.ConnectionId};
        await Clients.Others.SendAsync("NewUserArrived", JsonSerializer.Serialize(userInfo));
    }

    public async Task HelloUser(string userName, string user)
    {
        var userInfo = new UserInfo { userName = userName, connectionId = Context.ConnectionId };
        await Clients.Client(user).SendAsync("UserSaidHello", JsonSerializer.Serialize(userInfo));
    }

    public async Task SendSignal(string signal, string user)
    {
        await Clients.Client(user).SendAsync("SendSignal", Context.ConnectionId, signal);
    }
    
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Clients.All.SendAsync("UserDisconnect", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}