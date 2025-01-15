import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'services/authservice.dart'; // Import du service d'authentification
import 'MyAppBar.dart';
import 'footer.dart';

class AccountPage extends StatefulWidget {
  const AccountPage({super.key});

  @override
  _AccountPageState createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage>
    with SingleTickerProviderStateMixin {
  final AuthService authService = AuthService();
  bool? isLoggedIn;
  late Future<List<Map<String, dynamic>>> loginOptionsFuture;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _checkAuthStatus();

    // Initialise le futur une seule fois ici
    loginOptionsFuture = _fetchLoginOptions();

    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _checkAuthStatus() async {
    bool loggedIn = await authService.isLoggedIn();
    setState(() {
      isLoggedIn = loggedIn;
    });
  }

  Future<List<Map<String, dynamic>>> _fetchLoginOptions() async {
    try {
      List<Map<String, dynamic>>? options =
          await authService.fetchLoginOptions();
      if (options == null) {
        return [];
      }
      return options;
    } catch (e) {
      print('Erreur lors de la récupération des options de connexion: $e');
      return [];
    }
  }

  // En-tête animé
  Widget _buildAnimatedHeader() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: Container(
          height: 200,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.blueAccent, Colors.lightBlue],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(30),
              bottomRight: Radius.circular(30),
            ),
          ),
          child: const Center(
            child: Text(
              'Mon Compte',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Détecter la largeur de l'écran
    final bool isMobile = MediaQuery.of(context).size.width < 600;

    return Scaffold(
      appBar: const MyAppBar(),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (isLoggedIn != null && isLoggedIn == true)
                    _buildAnimatedHeader(),
                  const SizedBox(height: 20),
                  isLoggedIn == null
                      ? const CircularProgressIndicator()
                      : isLoggedIn!
                          ? _buildAccountContent()
                          : Column(
                              children: [
                                _buildLoginButton(context),
                                const SizedBox(height: 680),
                              ],
                            ),
                  const SizedBox(height: 40),
                  if (!isMobile) // Affiche le footer seulement si ce n'est pas mobile
                    const Footer(), // Footer ajouté ici
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccountContent() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Bienvenue sur votre compte',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          _buildLoginOptionsList(),
          const SizedBox(height: 20),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              backgroundColor: Colors.blueAccent,
            ),
            onPressed: () async {
              await authService.logout();
              setState(() {
                isLoggedIn = false;
              });
            },
            child: const Text('Se déconnecter', style: TextStyle(fontSize: 16)),
          ),
        ],
      ),
    );
  }

  Widget _buildLoginOptionsList() {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: loginOptionsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return const Center(
              child: Text('Erreur lors du chargement des options'));
        } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text('Aucune option disponible'));
        } else {
          print("snapshot.data : ${snapshot.data}");
          List<Map<String, dynamic>> options = snapshot.data!;
          print("options : $options");

          return ListView.builder(
            shrinkWrap: true,
            itemCount: options.length,
            itemBuilder: (context, index) {
              bool isConnected = options[index]['connected'] == 1;
              bool isUnlikable = options[index]['unlinkable'];
              return Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15)),
                child: ListTile(
                  leading: Image.network(
                    options[index]['icon'],
                    width: 24,
                    height: 24,
                  ),
                  title: Text(options[index]['display_name']),
                  subtitle: Text(
                    isConnected ? 'Connected' : 'Not Connected',
                    style: TextStyle(
                      color: isConnected ? Colors.green : Colors.red,
                    ),
                  ),
                  trailing: ElevatedButton(
                    onPressed: isConnected
                        ? !isUnlikable
                            ? null //Si il est connécté mais que il est unlikable
                            : () async {
                                //Si il est connecté et unlikable
                                try {
                                  await authService
                                      .unlinkService(options[index]['name']);
                                  Navigator.pushReplacementNamed(
                                      context, "/account");
                                } catch (e) {
                                  print('Erreur lors de la déconnexion: $e');
                                }
                              }
                        : () async {
                            //Si il est pas connecté
                            try {
                              await authService
                                  .connectToService(options[index]['name']);
                              Navigator.pushReplacementNamed(
                                  context, "/account");
                            } catch (e) {
                              print('Erreur lors de la connexion: $e');
                            }
                          },
                    child: Text(isConnected ? 'Désactivé' : 'Active'),
                  ),
                ),
              );
            },
          );
        }
      },
    );
  }

  Widget _buildLoginButton(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(double.infinity, 50),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          backgroundColor: Colors.blueAccent,
        ),
        onPressed: () {
          authService.login();
          if (!kIsWeb) {
            print("Connexion réussie sans callback");
            Navigator.pushReplacementNamed(context, "/account");
          }
        },
        child: const Text('Se connecter', style: TextStyle(fontSize: 16)),
      ),
    );
  }
}
