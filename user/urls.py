from . import views
from django.contrib import admin
from django.conf.urls import url,include
from django.views.decorators.cache import cache_page

urlpatterns = [
    url(r'^login$', (views.login), name="login"),
    url(r'^logout$', cache_page(60 * 60 * 24)(views.logout), name="logout"),
    url(r'^register$', (views.register), name="register"),
]