import 'package:flutter/material.dart';
import 'MyAppBar.dart';
import 'footer.dart'; // Importer le footer depuis un fichier séparé

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with SingleTickerProviderStateMixin {
  late ScrollController _scrollController;
  late AnimationController _animationController;
  late List<bool> _isVisible; // Suivre la visibilité des cartes

  @override
  void initState() {
    super.initState();

    // ScrollController pour surveiller le défilement
    _scrollController = ScrollController();
    _scrollController.addListener(_scrollListener);

    // Initialiser la visibilité des cartes (par défaut, elles sont cachées)
    _isVisible = [false, false, false, false];

    // AnimationController pour animer l'en-tête
    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    // Activer l'animation du header au chargement de la page
    _animationController.forward();  // Démarrer l'animation dès que la page est chargée
  }

  // Écouteur du ScrollController pour mettre à jour la visibilité des cartes
  void _scrollListener() {
    setState(() {
      for (int i = 0; i < _isVisible.length; i++) {
        // Ajustez la valeur de 150 pour déclencher les animations à différents moments
        if (_scrollController.offset > i * 150) {
          _isVisible[i] = true; // Rendre la carte visible
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
      appBar: const MyAppBar(), // En-tête personnalisé
      body: SingleChildScrollView(
        controller: _scrollController, // Attacher le ScrollController
        child: Column(
          children: [
            _buildAnimatedHeader(), // En-tête animé
            const SizedBox(height: 20),
            _buildFeatureCards(), // Cartes de fonctionnalités avec animations
            const SizedBox(height: 20),
            _buildTestimonialSection(), // Section des témoignages avec défilement horizontal
            const SizedBox(height: 40),
            _buildGetStartedButton(context), // Bouton "Commencer"
            const SizedBox(height: 40),
            const Footer(), // Footer importé depuis un fichier séparé
          ],
        ),
      ),
    );
  }

  // En-tête animé avec une transition d'opacité et de glissement
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
                  'Bienvenue sur notre AREA!',
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: 10),
                Text(
                  'Automatisez vos tâches en toute simplicité.',
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

  // Section des cartes de fonctionnalités avec animations lors du défilement
Widget _buildFeatureCards() {
  return Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16.0),
    child: Column(
      children: [
        _buildFeatureCard(
          0, 
          Icons.link, 
          'Connexion aux services',
          'Intégrez vos services favoris comme Gmail et Slack.',
          'Connectez plusieurs services et centralisez toutes vos activités dans une seule interface. Accédez rapidement à vos outils indispensables.'
        ),
        const SizedBox(height: 20),
        _buildFeatureCard(
          1, 
          Icons.build, 
          'Automatisations',
          'Créez des workflows pour automatiser vos tâches.',
          'Simplifiez vos processus de travail en créant des enchaînements d\'actions automatiques. Gagnez du temps et de l\'efficacité dans vos projets.'
        ),
        const SizedBox(height: 20),
        _buildFeatureCard(
          2, 
          Icons.person, 
          'Gestion des utilisateurs',
          'Gérez vos préférences et paramètres de compte.',
          'Personnalisez votre espace utilisateur et configurez vos notifications selon vos besoins. Gérez vos accès en toute simplicité.'
        ),
        const SizedBox(height: 20),
        _buildFeatureCard(
          3, 
          Icons.timer, 
          'Planification des tâches',
          'Définissez des déclencheurs basés sur le temps.',
          'Automatisez vos rappels et tâches à exécuter selon un planning précis. Planifiez en fonction de vos échéances.'
        ),
      ],
    ),
  );
}


  // Création d'une carte de fonctionnalité avec une animation d'apparition
  Widget _buildFeatureCard(int index, IconData icon, String title, String description, String details) {
    return AnimatedOpacity(
      opacity: _isVisible[index] ? 1.0 : 0.0, // Animation d'opacité
      duration: const Duration(milliseconds: 500),
      child: Transform.translate(
        offset: _isVisible[index] ? const Offset(0, 0) : const Offset(0, 50), // Animation de translation
        child: Card(
          elevation: 6,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(icon, size: 50, color: Colors.blueAccent), // Icône de la carte
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            description,
                            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Text(
                  details,
                  style: const TextStyle(fontSize: 14, color: Colors.black87), // Détails supplémentaires
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Section des témoignages avec défilement horizontal
  Widget _buildTestimonialSection() {
List<Map<String, String>> testimonials = [
  {
    'userName': 'Jean Dupont',
    'testimonial': 'Cette application m\'a permis de gagner un temps précieux en automatisant mes tâches quotidiennes !',
  },
  {
    'userName': 'Marie Curie',
    'testimonial': 'La simplicité de création de workflows est incroyable. Je recommande vivement cette plateforme.',
  },
  {
    'userName': 'Albert Einstein',
    'testimonial': 'AREA est une révolution pour l\'automatisation des services en ligne !',
  },
  {
    'userName': 'Isaac Newton',
    'testimonial': 'Une interface intuitive et des fonctionnalités puissantes. AREA est ma nouvelle application préférée.',
  },
  {
    'userName': 'Nikola Tesla',
    'testimonial': 'Le potentiel d\'automatisation de AREA est phénoménal. Je ne peux plus m\'en passer.',
  },
  {
    'userName': 'Ada Lovelace',
    'testimonial': 'Un outil moderne qui change la donne. J\'utilise AREA pour automatiser tous mes processus.',
  },
  {
    'userName': 'Charles Darwin',
    'testimonial': 'L\'adaptation est clé, et AREA me permet d\'adapter facilement mes tâches selon mes besoins.',
  },
  {
    'userName': 'Galileo Galilei',
    'testimonial': 'AREA est comme une révolution scientifique dans l\'automatisation des workflows.',
  },
  {
    'userName': 'Leonardo da Vinci',
    'testimonial': 'J\'apprécie la créativité que permet AREA dans la gestion des tâches automatisées.',
  },
  {
    'userName': 'Thomas Edison',
    'testimonial': 'Une application brillante ! AREA me fait économiser des heures chaque jour.',
  },
  {
    'userName': 'Stephen Hawking',
    'testimonial': 'AREA a rendu l\'automatisation des services accessible et facile à utiliser.',
  },
  {
    'userName': 'Marie Curie',
    'testimonial': 'J\'apprécie la simplicité et l\'efficacité de cette plateforme pour gérer mes tâches complexes.',
  },
  {
    'userName': 'Grace Hopper',
    'testimonial': 'AREA automatise mes tâches répétitives avec une précision et une rapidité sans égales.',
  },
  {
    'userName': 'Katherine Johnson',
    'testimonial': 'Avec AREA, je peux organiser et automatiser mes calculs en un rien de temps.',
  },
  {
    'userName': 'Margaret Hamilton',
    'testimonial': 'Un produit exceptionnel pour quiconque souhaite gagner du temps grâce à l\'automatisation.',
  },
];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Ce que nos utilisateurs disent',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 200, // Ajustez la hauteur des carrés ici
            child: ListView.builder(
              scrollDirection: Axis.horizontal, // Défilement horizontal
              itemCount: testimonials.length,
              itemBuilder: (context, index) {
                final item = testimonials[index];
                return _buildTestimonialCard(item['userName']!, item['testimonial']!);
              },
            ),
          ),
        ],
      ),
    );
  }

  // Carte de témoignage individuelle
  Widget _buildTestimonialCard(String userName, String testimonial) {
    return Container(
      width: 200, // Ajustez la largeur ici
      margin: const EdgeInsets.only(right: 10),
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                userName,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 5),
              Text(
                testimonial,
                style: const TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Bouton "Commencer"
  Widget _buildGetStartedButton(BuildContext context) {
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
          Navigator.pushNamed(context, '/actions'); // Redirection vers une autre page
        },
        child: const Text('Commencer', style: TextStyle(fontSize: 16)),
      ),
    );
  }
}
