from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin', admin.site.urls),
    path('educations/', include('education.urls')),
    # Serve frontend cart page để VNPay redirect về sau thanh toán sandbox
    path('Frontend/cart.html', TemplateView.as_view(template_name='cart.html'), name='cart-page'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Serve toàn bộ file tĩnh frontend (CSS/JS/assets) qua Django
    urlpatterns += static('/Frontend/', document_root=settings.BASE_DIR.parent / 'Frontend')
