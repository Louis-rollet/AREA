import 'package:flutter/material.dart';
import 'MyAppBar.dart'; // Importer votre AppBar personnalisée
import 'footer.dart'; // Importer votre Footer personnalisé

// Modèle pour un membre de l'équipe
class TeamMember {
  final String name;
  final String description;
  final String imagePath;

  TeamMember(
      {required this.name, required this.description, required this.imagePath});
}

// Liste des membres de l'équipe
final List<TeamMember> teamMembers = [
  TeamMember(
    name: 'Mehrdad',
    description:
        'Mehrdad se concentre sur l\'interface graphique du site. Il est passionné par le design et la création d\'expériences utilisateur intuitives.',
    imagePath: 'assets/images/Mehrdad.jpeg',
  ),
  TeamMember(
    name: 'Kylian',
    description:
        'Kylian est responsable de l\'architecture logicielle. Il aime résoudre des problèmes complexes avec des solutions élégantes et scalables.',
    imagePath: 'assets/images/Kylian.jpeg',
  ),
  TeamMember(
    name: 'Louis',
    description:
        'Louis développe des actions pour l\'application. Il est méticuleux et s\'assure que chaque action fonctionne parfaitement dans tous les scénarios.',
    imagePath: 'assets/images/Louis.jpeg',
  ),
  TeamMember(
    name: 'Victor',
    description:
        'Victor se concentre sur le développement des réactions. Il veille à ce que les interactions soient fluides et engageantes.',
    imagePath: 'assets/images/Victor.jpeg',
  ),
  TeamMember(
    name: 'Aurelien',
    description:
        'Aurelien gère les tests et la documentation. Il s\'assure que tout est testé et documenté avec soin pour garantir la qualité du produit.',
    imagePath: 'assets/images/Aurelien.jpeg',
  ),
];

// Page principale présentant l'équipe
class TeamPage extends StatefulWidget {
  const TeamPage({super.key});

  @override
  _TeamPageState createState() => _TeamPageState();
}

class _TeamPageState extends State<TeamPage>
    with SingleTickerProviderStateMixin {
  late ScrollController _scrollController;
  late AnimationController _animationController;
  late List<bool> _isVisible;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_scrollListener);

    _isVisible = List.filled(teamMembers.length, false);
    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    // Démarrer l'animation du header dès que la page est chargée
    _animationController.forward();
  }

  void _scrollListener() {
    setState(() {
      for (int i = 0; i < _isVisible.length; i++) {
        if (_scrollController.offset > i * 150) {
          _isVisible[i] = true;
        }
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const MyAppBar(), // Utilisation de votre AppBar personnalisée
      body: SingleChildScrollView(
        controller: _scrollController,
        child: Column(
          children: [
            _buildAnimatedHeader(), // Ajout du header animé
            const SizedBox(height: 20),
            _buildTeamGrid(),
            const SizedBox(height: 40),
            const Footer(), // Footer personnalisé
          ],
        ),
      ),
    );
  }

  // Widget pour l'en-tête animé
  Widget _buildAnimatedHeader() {
    return FadeTransition(
      opacity: _animationController,
      child: SlideTransition(
        position: _animationController.drive(
          Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero),
        ),
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
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Rencontrez notre équipe',
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: 10),
                Text(
                  'Découvrez nos talents et nos expertises',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTeamGrid() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: LayoutBuilder(
        builder: (context, constraints) {
          // Utilisation de LayoutBuilder pour adapter le nombre de colonnes
          int crossAxisCount = constraints.maxWidth < 600 ? 1 : 2;
          return GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossAxisCount, // Adapte le nombre de colonnes
              childAspectRatio: 1.5,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: teamMembers.length,
            itemBuilder: (context, index) {
              final member = teamMembers[index];
              return _buildTeamCard(index, member);
            },
          );
        },
      ),
    );
  }


  Widget _buildTeamCard(int index, TeamMember member) {
    return AnimatedOpacity(
      opacity: _isVisible[index] ? 1.0 : 0.0, // Animation d'opacité
      duration: const Duration(milliseconds: 500),
      child: Transform.translate(
        offset: _isVisible[index]
            ? const Offset(0, 0)
            : const Offset(0, 50), // Animation de translation
        child: Card(
          elevation: 6,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment
                  .center, // Centrer la photo et la description
              children: [
                Hero(
                  tag: member.imagePath,
                  child: CircleAvatar(
                    backgroundImage: AssetImage(member.imagePath),
                    radius: 35, // Taille plus petite de l'image
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  member.name,
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  member.description,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 14, color: Colors.grey),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
