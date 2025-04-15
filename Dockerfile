FROM ubuntu

# Definir o frontend do debconf para não interativo
ENV DEBIAN_FRONTEND=noninteractive

# Definir o fuso horário padrão para evitar prompts interativos
RUN ln -fs /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone

# Atualizar pacotes e instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-ita \
    git \
    unzip \
    wget \
    && apt-get clean

RUN apt update && apt upgrade

RUN apt install openjdk-21-jdk -y

# Clonar o repositório do Audiveris
RUN git clone https://github.com/Audiveris/audiveris.git /opt/audiveris

WORKDIR /opt/audiveris

# Construir o projeto usando Gradle
RUN ./gradlew clean build

# Permitir execução com argumentos
ENTRYPOINT ["./gradlew", "run"]