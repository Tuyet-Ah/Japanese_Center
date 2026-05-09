from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import  permissions

from education.services.cart_service import CartService
from education.serializers import  CartItemSerializer
from education.models import CartItem

# --- CART & CHECKOUT ---
class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart_items = CartService.get_user_cart(request.user)
        total_price = sum(item.course.price for item in cart_items)
        return Response({
            "cart_items": CartItemSerializer(cart_items, many=True).data,
            "total_price": float(total_price),
        })

    def post(self, request):
        try:
            item = CartService.add_to_cart(request.user, request.data.get('course_id'))
            return Response(CartItemSerializer(item).data, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class CartDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, pk):
        try:
            CartService.remove_from_cart(request.user, pk)
            return Response(status=204)
        except CartItem.DoesNotExist:
            return Response({"error": "Mục này không tồn tại"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)