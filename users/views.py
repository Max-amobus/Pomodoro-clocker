from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import RegisterForm, LoginForm
from .models import UserSettings


def register_view(request):
    # Якщо користувач вже авторизований, не пускаємо його на сторінку реєстрації
    if request.user.is_authenticated:
        return redirect('/')

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            # commit=False дозволяє змінити об'єкт перед збереженням у БД
            user = form.save(commit=False)

            # Обов'язковий крок: хешування пароля (твоя форма зберігає його як текст)
            user.set_password(form.cleaned_data['password'])
            user.save()

            # Створюємо стандартні налаштування таймера для нового користувача
            UserSettings.objects.create(user=user)

            # Одразу логінимо користувача і перенаправляємо на головну
            login(request, user)
            return redirect('/')
    else:
        form = RegisterForm()

    return render(request, 'register.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('/')

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']

            # authenticate перевіряє хеш пароля в базі
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return redirect('/')
            else:
                # Повідомлення про помилку, якщо дані не збігаються
                messages.error(request, "Неправильний логін або пароль.")
    else:
        form = LoginForm()

    return render(request, 'login.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('login')


@login_required
def settings_view(request):
    user_settings = UserSettings.objects.get(user=request.user)

    if request.method == 'POST':
        user_settings.pomodoro_time = request.POST.get('pomodoro_time', user_settings.pomodoro_time)
        user_settings.short_break = request.POST.get('short_break', user_settings.short_break)
        user_settings.long_break = request.POST.get('long_break', user_settings.long_break)

        user_settings.auto_start = request.POST.get('auto_start') == 'on'
        user_settings.sound_enabled = request.POST.get('sound_enabled') == 'on'

        user_settings.save()

        messages.success(request, "Налаштування успішно збережено!")
        return redirect('settings')

    return render(request, 'settings.html', {'settings': user_settings})