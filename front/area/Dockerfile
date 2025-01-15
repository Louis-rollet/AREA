FROM debian:latest AS build-env

RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    default-jre \
    default-jdk \
    wget \
    lib32stdc++6 \
    lib32z1 \
    build-essential \
    apt-transport-https \
    ca-certificates \
    software-properties-common

ARG FLUTTER_SDK=/usr/local/flutter
ARG FLUTTER_VERSION=3.24.0
ARG APP=/app/
ARG SHARED_VOLUME=/shared_volume
ARG ANDROID_SDK_ROOT=/usr/local/android-sdk

RUN mkdir -p $ANDROID_SDK_ROOT && \
    cd /tmp && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip commandlinetools-linux-11076708_latest.zip && \
    rm commandlinetools-linux-11076708_latest.zip && \
    mkdir -p $ANDROID_SDK_ROOT/cmdline-tools/latest && \
    mv cmdline-tools/* $ANDROID_SDK_ROOT/cmdline-tools/latest

ENV PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator"

RUN yes | sdkmanager --sdk_root=$ANDROID_SDK_ROOT --licenses && \
    sdkmanager --sdk_root=$ANDROID_SDK_ROOT "platform-tools" "platforms;android-33" "build-tools;33.0.2"

RUN git clone https://github.com/flutter/flutter.git $FLUTTER_SDK

RUN cd $FLUTTER_SDK && git fetch && git checkout $FLUTTER_VERSION

ENV PATH="$FLUTTER_SDK/bin:$FLUTTER_SDK/bin/cache/dart-sdk/bin:$PATH"

RUN flutter doctor -v

RUN mkdir $APP
COPY . $APP
WORKDIR $APP

RUN flutter clean
RUN flutter pub get
RUN flutter build web
RUN flutter build apk --debug

RUN mkdir -p $SHARED_VOLUME
RUN cp build/app/outputs/flutter-apk/app-debug.apk $SHARED_VOLUME/client.apk


FROM nginx:1.25.2-alpine

COPY --from=build-env /app/build/web /usr/share/nginx/html

COPY --from=build-env /shared_volume/client.apk /usr/share/nginx/html/client.apk

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]