# Pokemobile

Aplicativo Flutter que apresenta o frontend existente em uma WebView. O projeto web e a API permanecem separados. A WebView requer conexao com os servidores, e nao funciona offline.

## Preparar

Instale Flutter 3.38 ou superior (Dart 3.10 ou superior), Android Studio e Android SDK. Para iOS, use macOS com Xcode. Android requer API 24 ou superior.

No CMD, dentro desta pasta, instale as dependencias e verifique o projeto:

```cmd
flutter pub get
flutter analyze
```

O HTTP local destina-se apenas a testes Android em debug. Para iOS use um servidor HTTPS acessivel e informe WEB_APP_URL; nao altere as regras ATS de producao.

## Executar no emulador Android

A aplicacao usa http://10.0.2.2:3001 por padrao no emulador Android. Inicie o backend conforme o README dele, com FRONTEND_ORIGIN incluindo exatamente http://10.0.2.2:3001. Mantenha os demais valores do .env existente.

Inicie o frontend em outro terminal a partir de app/frontapp, configurando o endereco da API para o navegador dentro da WebView:

```cmd
set NEXT_PUBLIC_API_URL=http://10.0.2.2:3000/api
npm run dev -- -H 0.0.0.0
```

Depois, na pasta mobile:

```cmd
flutter run
```

Para um dispositivo fisico, use o IP local do computador em WEB_APP_URL, NEXT_PUBLIC_API_URL e FRONTEND_ORIGIN, por exemplo http://192.168.1.10:3001 para o frontend e http://192.168.1.10:3000/api para a API. O telefone e o servidor devem estar na mesma rede; permita as portas 3000 e 3001 no firewall. Exemplo:

```cmd
flutter run --dart-define=WEB_APP_URL=http://192.168.1.10:3001
```

Reinicie frontend e backend depois de alterar as variaveis. Configure NEXT_PUBLIC_API_URL antes de iniciar ou gerar o build do Next.js. O endereco localhost dentro do telefone aponta para o proprio telefone, nao para o computador.

## Producao

Configure o frontend e a API com HTTPS e origens corretas. O aplicativo em release exige uma URL HTTPS explicita:

```cmd
flutter build apk --release --dart-define=WEB_APP_URL=https://seu-dominio.example
```

A navegacao principal fica limitada a origem configurada. O endereco do frontend e configurado no build, nao pode ser alterado no dispositivo depois. A API e configurada separadamente no frontend.

O projeto gerado usa a assinatura de depuracao no build de release. Configure uma chave de assinatura propria e um applicationId definitivo antes de distribuir o aplicativo.

## Validacao

Com os servidores e dispositivo em funcionamento, confira carregamento do catalogo, detalhes, login, navegacao de volta e reconexao apos interromper o frontend.
