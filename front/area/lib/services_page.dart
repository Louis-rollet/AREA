import 'package:flutter/material.dart';
import 'MyAppBar.dart';
import 'footer.dart';

class ServicesPage extends StatefulWidget {
  const ServicesPage({super.key});

  @override
  _ServicesPageState createState() => _ServicesPageState();
}

class _ServicesPageState extends State<ServicesPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

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

  // Animated Header for Services Page
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
              'Nos Services',
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

  // Sample service list based on the provided screenshot details
final List<Map<String, dynamic>> services = [
  {
    'name': 'Google OAuth2',
    'description': 'Connect with Google services like Gmail and Drive.',
    'icon': Icons.cloud,
  },
  {
    'name': 'GitHub',
    'description': 'Monitor repositories and manage events.',
    'icon': Icons.code,
  },
  {
    'name': 'Windows Live',
    'description': 'Outlook email notifications and more.',
    'icon': Icons.email,
  },
  {
    'name': 'Dropbox',
    'description': 'Track file modifications and updates.',
    'icon': Icons.folder,
  },
  {
    'name': 'Twitch',
    'description': 'Get notified when a streamer starts streaming.',
    'icon': Icons.videocam, // Adjust icon to suit Twitch's functionality
  },
];


  // Dynamically generate the service grid view
  Widget _buildServiceGrid(double maxWidth) {
    int crossAxisCount = maxWidth > 600 ? 3 : 2; // Adjust items per row
    double childAspectRatio = maxWidth > 600 ? 1.2 : 0.9;

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: childAspectRatio,
      ),
      itemCount: services.length,
      itemBuilder: (context, index) {
        return Card(
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Icon(services[index]['icon'], color: Colors.blueAccent, size: 35),
                const SizedBox(height: 10),
                Text(
                  services[index]['name'],
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 5),
                Flexible(
                  child: Text(
                    services[index]['description'],
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const MyAppBar(),
      body: LayoutBuilder(
        builder: (context, constraints) {
          return SingleChildScrollView(
            child: Column(
              children: [
                _buildAnimatedHeader(),
                const SizedBox(height: 20),
                Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: constraints.maxWidth > 800 ? 32.0 : 16.0,
                  ),
                  child: _buildServiceGrid(constraints.maxWidth),
                ),
                const Footer(),
              ],
            ),
          );
        },
      ),
    );
  }
}
