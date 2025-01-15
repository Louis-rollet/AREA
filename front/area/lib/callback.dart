import 'package:flutter/material.dart';
import 'services/authservice.dart';

class CallbackPage extends StatefulWidget {
  const CallbackPage({super.key});

  @override
  _CallbackPageState createState() => _CallbackPageState();
}

class _CallbackPageState extends State<CallbackPage> {
  bool isTokenValid = false; // État pour savoir si le token est valide
  String statusText = 'Vérification de l\'authentification...'; // Texte d'état

  @override
  void initState() {
    super.initState();
    _checkForAccessToken();
  }

  void _checkForAccessToken() async {
    AuthService authService = AuthService();
    // Récupérer l'URL actuelle
    final currentUrl = Uri.base.toString();
    print('URL actuelle : $currentUrl');

    // Vérifier si l'URL contient 'access_token'
    if (currentUrl.contains('access_token')) {
      print('URL contient access_token');
      final tokenStartIndex =
          currentUrl.indexOf('access_token=') + 'access_token='.length;
      final tokenEndIndex = currentUrl.indexOf('&', tokenStartIndex);
      final token = (tokenEndIndex == -1)
          ? currentUrl.substring(tokenStartIndex)
          : currentUrl.substring(tokenStartIndex, tokenEndIndex);

      print('Token extrait : $token');
      // Sauvegarder le token
      await authService.saveToken(token);
      print('Utilisateur connecté avec succès');

      // Mettre à jour l'état pour activer le bouton et changer le texte
      setState(() {
        isTokenValid = true; // Le token est valide
        statusText = 'Authentifié'; // Changer le texte d'état
      });
    } else {
      print('Aucun access_token dans l\'URL');
      // Pas de token valide
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Callback Page'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(statusText), // Afficher le texte d'état
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: isTokenValid
                  ? () {
                      Navigator.pushReplacementNamed(context, '/account');
                    }
                  : null, // Désactiver le bouton si le token n'est pas valide
              child: const Text('Continuer'),
            ),
          ],
        ),
      ),
    );
  }
}
