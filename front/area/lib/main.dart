import 'package:flutter/material.dart';
import 'account.dart';
import 'home.dart';
import 'actions.dart';
import 'notification.dart';
import 'callback.dart';
import 'services/authservice.dart';
import 'services_page.dart';
import 'document.dart';
import 'team.dart';

const maincolor = Color(0xFF1E1E1E);

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OnlyArea',
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      onGenerateRoute: (settings) {
        print('check route: ${settings.name}');
        if (settings.name!.startsWith('/callback')) {
          return MaterialPageRoute(
            builder: (context) => const CallbackPage(),
          );
        }

        // Appliquer la logique d'authentification ici avant de retourner la route
        return MaterialPageRoute(
          builder: (context) {
            // Utilisation du FutureBuilder pour attendre le résultat de la vérification d'authentification
            return FutureBuilder<bool>(
              future: AuthService().isLoggedIn(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  // Afficher un indicateur de chargement pendant la vérification de l'authentification
                  return const Scaffold(
                    body: Center(child: CircularProgressIndicator()),
                  );
                } else if (snapshot.hasData && snapshot.data == true) {
                  // Si l'utilisateur est authentifié, afficher la page demandée
                  return _getPage(settings.name!);
                } else {
                  print('User not authenticated');
                  // Si l'utilisateur n'est pas authentifié, le rediriger vers la page de login
                  return const AccountPage();
                }
              },
            );
          },
        );
      },
    );
  }

  // Méthode pour obtenir la page en fonction du nom de la route
  Widget _getPage(String routeName) {
    switch (routeName) {
      case '/actions':
        return const ActionsPage();
      case '/account':
        return const AccountPage();
      case '/notifications':
        return const NotificationsPage();
      case '/nos-services':
        return const ServicesPage();
      case '/documentation':
        return const DocumentationPage();
      case '/team':
        return const TeamPage();
      default:
        return const HomePage();
    }
  }
}
