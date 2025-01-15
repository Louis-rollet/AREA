import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_markdown/flutter_markdown.dart';  // Import pour afficher le markdown
import 'MyAppBar.dart';  // AppBar personnalisé
import 'footer.dart';  // Footer personnalisé
import 'package:url_launcher/url_launcher.dart'; // Import pour ouvrir les liens

class DocumentationPage extends StatefulWidget {
  const DocumentationPage({super.key});

  @override
  _DocumentationPageState createState() => _DocumentationPageState();
}

class _DocumentationPageState extends State<DocumentationPage> {
  final List<String> titles = [
    '1) Google',
    '2) Github',
    '3) Microsoft',
    '4) Dropbox',
    '5) Twitch',
  ];

  int selectedIndex = 0; // Index de la partie actuellement affichée
  String content = '';  // Contenu à afficher

  @override
  void initState() {
    super.initState();
    _loadContent('assets/documentation/partie1.md');
  }

  // Fonction pour charger le contenu d'un fichier Markdown
  Future<void> _loadContent(String filePath) async {
    String fileContent = await rootBundle.loadString(filePath);
    setState(() {
      content = fileContent; // Mettre à jour le contenu à afficher
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const MyAppBar(), // AppBar personnalisé
      body: Column(
        children: [
          _buildDocumentationHeader(),  // Header de la page documentation
          Expanded(
            child: Row(
              children: [
                _buildTitleList(), // Liste des titres à gauche
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      children: [
                        const SizedBox(height: 20),
                        _buildAnimatedContent(), // Contenu de la partie sélectionnée avec animation
                        const SizedBox(height: 40),
                        const Footer(),  // Footer personnalisé
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Construction du header avec taille réduite
  Widget _buildDocumentationHeader() {
    return Container(
      height: 200,
      width: double.infinity,
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
          'Documentation AREA',
          style: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  // Construction de la liste des titres à gauche
  Widget _buildTitleList() {
    return Container(
      width: 200, // Largeur de la colonne des titres
      color: Colors.grey[200], // Couleur d'arrière-plan pour séparer visuellement
      child: ListView.builder(
        padding: const EdgeInsets.all(8.0),
        itemCount: titles.length,
        itemBuilder: (context, index) {
          return ListTile(
            title: Text(
              titles[index],
              style: TextStyle(
                fontSize: 16,
                color: selectedIndex == index ? Colors.blueAccent : Colors.black,
              ),
            ),
            onTap: () {
              setState(() {
                selectedIndex = index;
                // Charger le fichier markdown correspondant
                _loadContent('assets/documentation/partie${index + 1}.md');
              });
            },
          );
        },
      ),
    );
  }

  // Contenu de la section sélectionnée avec animation
  Widget _buildAnimatedContent() {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 500),
      transitionBuilder: (Widget child, Animation<double> animation) {
        return FadeTransition(opacity: animation, child: child);
      },
      child: _buildMarkdownContent(), // Affiche le contenu markdown formaté
    );
  }

  // Fonction pour afficher le contenu Markdown
  Widget _buildMarkdownContent() {
    return Padding(
      key: ValueKey(selectedIndex),
      padding: const EdgeInsets.all(16.0),
      child: MarkdownBody(
        data: content, // Affiche le contenu Markdown
        onTapLink: (text, url, title) {
          if (url != null) {
            _launchUrl(url); // Ouvre le lien dans le navigateur
          }
        },
      ),
    );
  }

  // Fonction pour ouvrir un lien dans le navigateur
  Future<void> _launchUrl(String url) async {
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }
}

void main() => runApp(const MaterialApp(
  home: DocumentationPage(),
));
