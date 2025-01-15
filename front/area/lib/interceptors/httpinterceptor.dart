import 'package:http/http.dart' as http;
import '../services/authservice.dart';

class HttpInterceptor {
  final AuthService _authService = AuthService();

  // Méthode pour envoyer une requête avec le token
  Future<http.Response> get(String url) async {
    var token = await _authService.getToken(); // Récupère le token
    token ??= '';
    return http.get(
      Uri.parse(url),
      headers: _createHeaders(token),
    );
  }

  Future<http.Response> post(
      String url, Map<String, String> userHeaders, dynamic body) async {
    var token = await _authService.getToken();
    token ??= '';

    // Fusionner les en-têtes de l'utilisateur avec ceux de l'authentification
    final headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
      ...userHeaders,
    };

    return http.post(
      Uri.parse(url),
      headers: headers,
      body: body,
    );
  }

  Future<http.Response> put(
      String url, Map<String, String> userHeaders, dynamic body) async {
    var token = await _authService.getToken();
    token ??= '';

    // Fusionner les en-têtes de l'utilisateur avec ceux de l'authentification
    final headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
      ...userHeaders,
    };

    return http.put(
      Uri.parse(url),
      headers: headers,
      body: body,
    );
  }

  // Autres méthodes (put, delete, etc.) peuvent être ajoutées de la même manière.
  Future<http.Response> delete(
      String url, Map<String, String>? userHeaders, dynamic body) async {
    var token = await _authService.getToken();
    token ??= '';

    final headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
      ...userHeaders ?? {},
    };

    return http.delete(
      Uri.parse(url),
      headers: headers,
      body: body,
    );
  }

  // Méthode privée pour créer les headers avec le token
  Map<String, String> _createHeaders(String token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }
}
