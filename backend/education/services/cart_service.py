from education.models import CartItem, Enrollment, Course

class CartService:
    # --- Logic Giỏ hàng ---
    @staticmethod
    def get_user_cart(user):
        return CartItem.objects.filter(user=user).select_related('course')

    @staticmethod
    def add_to_cart(user, course_id):
        course = Course.objects.get(id=course_id)
        if Enrollment.objects.filter(user=user, course=course,status="paid").exists() :
            raise ValueError("Khóa học này đã được đăng kí")
 
        if CartItem.objects.filter(user=user, course=course).exists():
            raise ValueError("Khóa học đã có trong giỏ hàng")
        return CartItem.objects.create(user=user, course=course)

    @staticmethod
    def remove_from_cart(user, cart_item_id):
        item = CartItem.objects.get(id=cart_item_id, user=user)
        item.delete()