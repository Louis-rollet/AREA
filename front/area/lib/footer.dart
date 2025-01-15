import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart'; // To open external links

class Footer extends StatelessWidget {
  const Footer({super.key});

  // Function to launch URLs for navigation or external links
  void _launchURL(BuildContext context, String url) async {
    if (url.startsWith('/')) {
      // Use Navigator for internal routes
      Navigator.pushNamed(context, url);
    } else if (await canLaunch(url)) {
      // Launch external URLs using url_launcher
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.blueGrey[900],
      padding: const EdgeInsets.all(20.0),
      child: LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          // Check the width to determine the layout
          bool isSmallScreen = constraints.maxWidth < 600;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Text(
                '© 2024 AREA Automations',
                style: TextStyle(color: Colors.white, fontSize: 14),
              ),
              const SizedBox(height: 20),
              // Section links like "About Us", "Our Team", "Join Us"
              isSmallScreen
                  ? Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: _buildFooterLinks(context),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: _buildFooterLinks(context),
                    ),
              const SizedBox(height: 20),
              // Social media icons
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: _buildSocialMediaIcons(context),
              ),
            ],
          );
        },
      ),
    );
  }

  List<Widget> _buildFooterLinks(BuildContext context) {
    return [
      TextButton(
        onPressed: () {
          _launchURL(context, 'https://www.linkedin.com/in/louis-rollet/');
        },
        child: const Text(
          'À propos de nous',
          style: TextStyle(color: Colors.white),
        ),
      ),
      const SizedBox(width: 20),
      TextButton(
        onPressed: () {
          _launchURL(context, 'https://www.linkedin.com/in/louis-rollet/');
        },
        child: const Text(
          'Contactez-nous',
          style: TextStyle(color: Colors.white),
        ),
      ),
      const SizedBox(width: 20),
      TextButton(
        onPressed: () {
          Navigator.pushReplacementNamed(context, '/team');
        },
        child: const Text(
          'Notre équipe',
          style: TextStyle(color: Colors.white),
        ),
      ),
      const SizedBox(width: 20),
      TextButton(
        onPressed: () {
          _launchURL(context, 'https://www.linkedin.com/in/louis-rollet/');
        },
        child: const Text(
          'Rejoignez-nous',
          style: TextStyle(color: Colors.white),
        ),
      ),
    ];
  }

  List<Widget> _buildSocialMediaIcons(BuildContext context) {
    return [
      IconButton(
        icon: const Icon(Icons.facebook, color: Colors.white),
        onPressed: () {
          _launchURL(context, 'https://www.linkedin.com/in/louis-rollet/');
        },
      ),
      const SizedBox(width: 10),
      IconButton(
        icon: const Icon(Icons.alternate_email, color: Colors.white),
        onPressed: () {
          _launchURL(context, 'https://www.linkedin.com/in/louis-rollet/');
        },
      ),
      const SizedBox(width: 10),
      IconButton(
        icon: const Icon(Icons.business, color: Colors.white),
        onPressed: () {
          _launchURL(context, 'https://www.linkedin.com/in/louis-rollet/');
        },
      ),
    ];
  }
}
