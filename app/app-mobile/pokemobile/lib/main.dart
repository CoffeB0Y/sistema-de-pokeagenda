import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
// Kept for compatibility with Flutter versions predating material_ui.
// ignore: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(const PokeMobileApp());

class PokeMobileApp extends StatelessWidget {
  const PokeMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pokédex',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorSchemeSeed: const Color(0xffc62828)),
      home: const PokedexWebView(),
    );
  }
}

class PokedexWebView extends StatefulWidget {
  const PokedexWebView({super.key});

  @override
  State<PokedexWebView> createState() => _PokedexWebViewState();
}

class _PokedexWebViewState extends State<PokedexWebView> {
  static const _configuredUrl = String.fromEnvironment('WEB_APP_URL');
  late final Uri _initialUri;
  late final WebViewController _controller;
  bool _loading = true;
  bool _failed = false;
  int _progress = 0;

  bool get _validUrl =>
      _initialUri.host.isNotEmpty &&
      (_initialUri.scheme == 'http' || _initialUri.scheme == 'https') &&
      (!kReleaseMode || _initialUri.scheme == 'https');

  @override
  void initState() {
    super.initState();
    final fallback = Platform.isAndroid
        ? 'http://10.0.2.2:3001'
        : 'http://localhost:3001';
    _initialUri =
        Uri.tryParse(_configuredUrl.isEmpty ? fallback : _configuredUrl) ??
        Uri();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) {
              setState(() {
                _loading = true;
                _failed = false;
                _progress = 0;
              });
            }
          },
          onProgress: (value) {
            if (mounted) setState(() => _progress = value);
          },
          onPageFinished: (_) {
            if (mounted) setState(() => _loading = false);
          },
          onWebResourceError: (error) {
            if (error.isForMainFrame == true && mounted) {
              setState(() {
                _failed = true;
                _loading = false;
              });
            }
          },
          onNavigationRequest: (request) {
            final uri = Uri.tryParse(request.url);
            if (uri == null ||
                (uri.scheme != 'http' && uri.scheme != 'https') ||
                uri.origin != _initialUri.origin) {
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      );
    if (_validUrl) {
      _controller.loadRequest(_initialUri);
    } else {
      _loading = false;
      _failed = true;
    }
  }

  Future<void> _retry() async {
    if (!_validUrl) return;
    setState(() {
      _failed = false;
      _loading = true;
    });
    await _controller.loadRequest(_initialUri);
  }

  Future<bool> _onBack() async {
    if (!_failed && await _controller.canGoBack()) {
      await _controller.goBack();
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (!didPop && await _onBack() && Platform.isAndroid) {
          await SystemNavigator.pop();
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: Stack(
            children: [
              WebViewWidget(controller: _controller),
              if (_loading) LinearProgressIndicator(value: _progress / 100),
              if (_failed)
                ColoredBox(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.wifi_off, size: 48),
                          const SizedBox(height: 16),
                          const Text(
                            'Não foi possível abrir a Pokédex.',
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Verifique a conexão e o endereço do aplicativo.',
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _retry,
                            child: const Text('Tentar novamente'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
