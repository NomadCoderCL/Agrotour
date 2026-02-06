from channels.generic.websocket import AsyncJsonWebsocketConsumer

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # TODO: Get user/tenant from scope (e.g. headers or query string for JWT)
        # For now, we accept all connections for development
        self.group_name = "notifications_global"
        
        # Join group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive_json(self, content):
        # Echo for testing
        await self.send_json({"echo": content})

    async def send_notification(self, event):
        # Handler to send notification to client
        await self.send_json(event["message"])
