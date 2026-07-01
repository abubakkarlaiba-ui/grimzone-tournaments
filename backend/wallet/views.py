from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

class WalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'tokens': request.user.tokens})
