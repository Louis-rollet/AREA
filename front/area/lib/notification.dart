import 'package:flutter/material.dart';

import 'MyAppBar.dart';

class NotificationsPage extends StatelessWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: MyAppBar(),
      body: Center(
        child: Text('Page Notifications'),
      ),
    );
  }
}