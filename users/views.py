from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from .forms import RegisterForm, LoginForm

def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)

        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data["password"])
            user.save()

            return redirect("/")

    else:
        form = RegisterForm()

    context = {
        "form": form
    }

    return render(request, "register.html", context)

def login_user(request):
    if request.method == "POST":
        form = LoginForm(request.POST)

        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]

            user = authenticate(
                request,
                username=username,
                password=password
            )

            if user is not None:
                login(request, user)
                return redirect("/")

    else:
        form = LoginForm()

    context = {
        "form": form
    }

    return render(request, "login.html", context)

def logout_user(request):

    logout(request)

    return redirect("/")