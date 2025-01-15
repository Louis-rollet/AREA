import 'package:flutter/foundation.dart';
import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';
import 'package:http/http.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../interceptors/httpinterceptor.dart'; // Import the HttpInterceptor class
import 'dart:convert'; // To handle JSON encoding/decoding
import 'package:url_launcher/url_launcher.dart';

class AuthService {
  Future<void> login() async {
    if (kIsWeb) {
      final Uri authorizeUrl =
          Uri.https("api.louis.yt", '/login', {"platform": "web"});
      // Ouvrir l'URL d'autorisation dans le navigateur
      if (await canLaunchUrl(authorizeUrl)) {
        print("WEB: oui");
        await launchUrl(authorizeUrl, webOnlyWindowName: '_self');
      } else {
        print('Impossible d\'ouvrir l\'URL d\'autorisation');
      }
      print('URL d\'autorisation ouverte dans le navigateur');
    } else {
      try {
        // URL d'autorisation de ton API Auth0 ou autre
        final Uri authorizeUrl =
            Uri.https("api.louis.yt", '/login', {"platform": "app"});

        const option = FlutterWebAuth2Options(
          timeout: 120,
        );
        // Lance l'authentification
        final result = await FlutterWebAuth2.authenticate(
          url: authorizeUrl.toString(),
          callbackUrlScheme: "myapp",
          options: option,
        );

        // Le résultat contiendra l'URL de retour avec l'access token
        final accessToken = Uri.parse(result).queryParameters['access_token'];

        if (accessToken != null) {
          print("Access uwu Token uwu: $accessToken");
          saveToken(accessToken);
        } else {
          print("Aucun access token trouvé");
        }
      } catch (e) {
        print("Erreur lors de l'authentification: $e");
      }
    }
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');
    return token != null;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    var url = 'https://api.louis.yt/logout';
    if (kIsWeb) {
      url = 'https://api.louis.yt/logout?platform=web';
    } else {
      url = 'https://api.louis.yt/logout?platform=app';
    }
    Uri url_uri = Uri.parse(url);

    if (kIsWeb) {
      if (await canLaunchUrl(url_uri)) {
        print("WEB: oui");
        await launchUrl(url_uri, webOnlyWindowName: '_self');
      } else {
        print('Impossible d\'ouvrir l\'URL d\'autorisation');
      }
    } else {
      try {
        const option = FlutterWebAuth2Options(
          timeout: 120,
        );
        // Lance l'authentification
        await FlutterWebAuth2.authenticate(
          url: url.toString(),
          callbackUrlScheme: "myapp",
          options: option,
        );
      } catch (e) {
        print("Erreur lors de l'authentification: $e");
      }
    }
  }

  Future<void> saveToken(String accessToken) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', accessToken);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }

  Future<List<Map<String, dynamic>>?> fetchLoginOptions() async {
    try {
      final HttpInterceptor httpin = HttpInterceptor();
      final response =
          await httpin.get('https://api.louis.yt/action-reaction/Service');
      print(response.body);

      if (response.statusCode == 200) {
        List<dynamic> jsonResponse = json.decode(response.body);
        return jsonResponse
            .map((option) => {
                  'id': option['id'],
                  'name': option['name'],
                  'connected':
                      option['connected'], // Add the 'connected' field here
                  'unlinkable': option['unlinkable'],
                  'display_name': option['display_name'],
                  'icon': option['icon'],
                })
            .toList();
      } else {
        print(
            'Failed to load login options. Status code: ${response.statusCode}');
        return null;
      }
    } catch (error) {
      print('Error fetching login options: $error');
      return null;
    }
  }

  Future<void> connectToService(String serviceName) async {
    var token = await getToken();

    // Si le token est null, effectuer l'authentification
    if (token == null || token.isEmpty) {
      await login(); // Appelle la méthode login() pour récupérer le token
      token = await getToken(); // Re-récupère le token après login
    }

    print('service name $serviceName');

    final Uri authorizeUrl = Uri.http(
      "api.louis.yt",
      '/custom-login',
      {
        "connection": serviceName,
        "token": '$token',
        "Content-Type": 'application/json',
        "Access-Control-Allow-Origin": '*',
      },
    );

    // Pour le web, la plateforme est passée dans le body comme dans votre exemple
    if (await canLaunchUrl(authorizeUrl)) {
      print("WEB: oui");
      await launchUrl(authorizeUrl);
    } else {
      print('Impossible d\'ouvrir l\'URL d\'autorisation');
    }
  }

  Future<bool> unlinkService(String serviceName) async {
    final HttpInterceptor httpin = HttpInterceptor();
    var token = await getToken();

    // Si le token est null, effectuer l'authentification
    if (token == null || token.isEmpty) {
      await login(); // Appelle la méthode login() pour récupérer le token
      token = await getToken(); // Re-récupère le token après login
    }

    Response result = await httpin.delete('https://api.louis.yt/unlink', null,
        jsonEncode({'service': serviceName}));

    if (result.statusCode == 200) {
      print('Service unlinked');
      return true;
    } else {
      print('Failed to unlink service. Status code: ${result.statusCode}');
      return false;
    }
  }
}
