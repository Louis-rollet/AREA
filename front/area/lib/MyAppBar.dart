import 'package:flutter/material.dart';

const maincolor = Color(0xFF1E1E1E);

class MyAppBar extends StatelessWidget implements PreferredSizeWidget {
  const MyAppBar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(50.0);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        bool isSmallScreen = constraints.maxWidth < 800;

        return AppBar(
          leading: null, // Retirez le menu burger
          title: isSmallScreen
              ? const Text('OnlyArea',
                  style: TextStyle(color: maincolor, fontSize: 20))
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    TextButton.icon(
                      onPressed: () {
                        Navigator.pushReplacementNamed(context, '/');
                      },
                      icon: const Icon(Icons.home, color: maincolor),
                      label: const Text('Accueil',
                          style: TextStyle(color: maincolor)),
                    ),
                    const SizedBox(width: 20),
                    TextButton.icon(
                      onPressed: () {
                        Navigator.pushReplacementNamed(context, '/actions');
                      },
                      icon: const Icon(Icons.swap_horiz, color: maincolor),
                      label: const Text('Actions/Réactions',
                          style: TextStyle(color: maincolor)),
                    ),
                    TextButton.icon(
                      onPressed: () {
                        Navigator.pushReplacementNamed(context, '/nos-services');
                      },
                      icon: const Icon(Icons.room_service, color: maincolor),
                      label: const Text('Nos services',
                          style: TextStyle(color: maincolor)),
                    ),
                    TextButton.icon(
                      onPressed: () {
                        Navigator.pushReplacementNamed(context, '/documentation');
                      },
                      icon: const Icon(Icons.edit_document, color: maincolor),
                      label: const Text('Notre Documentation',
                          style: TextStyle(color: maincolor)),
                    ),
                  ],
                ),
          backgroundColor: Colors.white,
          actions: [
            if (isSmallScreen) ...[
              IconButton(
                icon: const Icon(Icons.home, color: maincolor),
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/');
                },
              ),
              IconButton(
                icon: const Icon(Icons.swap_horiz, color: maincolor),
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/actions');
                },
              ),
            ],
            IconButton(
              icon: const Icon(Icons.account_circle, color: maincolor),
              onPressed: () {
                Navigator.pushReplacementNamed(context, '/account');
              },
            ),
          ],
        );
      },
    );
  }
}

class MySidenav extends StatelessWidget {
  const MySidenav({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          const DrawerHeader(
            decoration: BoxDecoration(
              color: maincolor,
            ),
            child: Text('Menu', style: TextStyle(color: Colors.white)),
          ),
          ListTile(
            leading: const Icon(Icons.home),
            title: const Text('Accueil'),
            onTap: () {
              Navigator.pushReplacementNamed(context, '/');
            },
          ),
          ListTile(
            leading: const Icon(Icons.swap_horiz),
            title: const Text('Actions/Réactions'),
            onTap: () {
              Navigator.pushReplacementNamed(context, '/actions');
            },
          ),
          ListTile(
            leading: const Icon(Icons.account_circle),
            title: const Text('Mon Compte'),
            onTap: () {
              Navigator.pushReplacementNamed(context, '/account');
            },
          ),
        ],
      ),
    );
  }
}

class MyScaffold extends StatelessWidget {
  const MyScaffold({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      drawer: MySidenav(),
      appBar: MyAppBar(),
      body: Center(child: Text('Contenu de la page')),
    );
  }
}
