import 'package:flutter/material.dart';
import 'MyAppBar.dart';
import 'services/areaservice.dart';
import 'ActionChoose.dart';
import 'ReactionsChoose.dart';
import 'dart:convert';

class ActionsPage extends StatefulWidget {
  const ActionsPage({super.key});

  @override
  _ActionsPageState createState() => _ActionsPageState();
}

class _ActionsPageState extends State<ActionsPage>
    with SingleTickerProviderStateMixin {
  final areaService = AreaService();
  late Future<List<ActionModel>> actionsFuture;
  late Future<List<Reaction>> reactionsFuture;
  late Future<List<Area>> areasFuture;

  TextEditingController nameController = TextEditingController();
  TextEditingController descriptionController = TextEditingController();
  ActionChoose? actionChoose;
  ReactionsChoose? reactionChoose;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  void _showAreaDetailsDialog(Area area) {
    Map<String, dynamic>? parametersMap;

    if (area.parameters != null && area.parameters!.isNotEmpty) {
      try {
        final decoded = jsonDecode(area.parameters!);
        if (decoded is String) {
          parametersMap = jsonDecode(decoded);
        } else if (decoded is Map<String, dynamic>) {
          parametersMap = decoded;
        }
      } catch (e) {
        print('Erreur de décodage des paramètres JSON : $e');
        parametersMap = null;
      }
    }

    // Future pour obtenir les réactions associées
    late Future<List<Reaction>> associatedReactions =
        areaService.getReactionsForArea(area.id);
// Future pour obtenir l'action associée
    late Future<ActionModel> action = areaService.getActionById(area.actionId);

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(
            'Détails de ${area.name}',
            style: const TextStyle(
                fontWeight: FontWeight.bold, color: Colors.blueAccent),
          ),
          content: FutureBuilder<ActionModel>(
            future: action,
            builder: (context, actionSnapshot) {
              if (actionSnapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              } else if (actionSnapshot.hasError) {
                return Text('Erreur : ${actionSnapshot.error}');
              }

              return FutureBuilder<List<Reaction>>(
                future: associatedReactions,
                builder: (context, reactionsSnapshot) {
                  if (reactionsSnapshot.connectionState ==
                      ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (reactionsSnapshot.hasError) {
                    return Text('Erreur : ${reactionsSnapshot.error}');
                  }

                  final actionData = actionSnapshot.data!;
                  final reactionsData = reactionsSnapshot.data ?? [];

                  return SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 8),
                        _buildSectionTitle('Informations de l\'area'),
                        const SizedBox(height: 8),
                        _buildInfoRow(Icons.label, 'Nom', area.name),
                        _buildInfoRow(Icons.description, 'Description',
                            area.description ?? 'Aucune description'),
                        _buildInfoRow(
                            Icons.date_range, 'Créé le', area.createdAt),
                        _buildInfoRow(
                          area.status ? Icons.check_circle : Icons.cancel,
                          'Statut',
                          area.status ? 'Active' : 'Inactive',
                          color: area.status ? Colors.green : Colors.red,
                        ),
                        const SizedBox(height: 16),
                        _buildParameterCard(actionData.name, parametersMap!),
                        const SizedBox(height: 16),
                        _buildSectionTitle('Réactions associées'),
                        const SizedBox(height: 8),
                        if (reactionsData.isNotEmpty)
                          ...reactionsData
                              .map((reaction) => _buildReactionCard(reaction))
                        else
                          const Text('Aucune réaction associée',
                              style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  );
                },
              );
            },
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Fermer'),
            ),
          ],
        );
      },
    );
  }

// Fonction pour afficher les paramètres dans un Card
  Widget _buildParameterCard(
      String actionName, Map<String, dynamic> parameters) {
    return Card(
      color: Colors.blueAccent[50],
      elevation: 2,
      margin: const EdgeInsets.symmetric(vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              actionName,
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Colors.blueAccent),
            ),
            const SizedBox(height: 8),
            ...parameters.entries.map((entry) =>
                _buildParameterRow(entry.key, entry.value.toString())),
          ],
        ),
      ),
    );
  }

  Widget _buildParameterRow(String key, String value) {
    return Padding(
      padding: const EdgeInsets.only(left: 24.0, top: 4, bottom: 4),
      child: Row(
        children: [
          Text('$key: ', style: const TextStyle(fontWeight: FontWeight.bold)),
          Expanded(
              child:
                  Text(value, style: const TextStyle(color: Colors.black87))),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
          fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blueAccent),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value,
      {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Icon(icon, color: color ?? Colors.black54),
          const SizedBox(width: 8),
          Text('$label : ',
              style: const TextStyle(fontWeight: FontWeight.bold)),
          Expanded(
              child:
                  Text(value, style: const TextStyle(color: Colors.black87))),
        ],
      ),
    );
  }

  Widget _buildReactionCard(Reaction reaction) {
    Map<String, dynamic>? decodedParams;

    try {
      if (reaction.parameters != null) {
        decodedParams = json.decode(
            reaction.parameters!); // Ajout de `!` pour assurer non-nullabilité
      } else {
        decodedParams = {}; // Ou utilisez `null` si vous préférez.
      }
    } catch (e) {
      print("Erreur de décodage des paramètres de la réaction : $e");
      decodedParams = null;
    }

    return Card(
      color: Colors.blueAccent[50],
      elevation: 2,
      margin: const EdgeInsets.symmetric(vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              reaction.name,
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Colors.blueAccent),
            ),
            const SizedBox(height: 8),
            if (decodedParams != null && decodedParams.isNotEmpty)
              ...decodedParams.entries.map((entry) =>
                  _buildParameterRow(entry.key, entry.value.toString()))
            else
              const Text('Aucun paramètre supplémentaire',
                  style: TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    actionsFuture = areaService.getActions();
    reactionsFuture = areaService.getReactions();
    areasFuture = areaService.getAreas();
    actionChoose = ActionChoose(actionsFuture: actionsFuture);
    reactionChoose = ReactionsChoose(reactionsFuture: reactionsFuture);
    // Initialiser l'AnimationController
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

    // Démarrer l'animation
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  // Méthode pour l'en-tête animé
  Widget _buildAnimatedHeader() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: Container(
          height: 150,
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
              'Gérer vos Actions',
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

  // Fonction pour ouvrir le pop-up et créer une nouvelle action/réaction
  void _openCreateDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Créer une nouvelle action/réaction'),
          scrollable: true,
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Champ pour le nom de l'action-réaction
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Nom de l\'action/réaction',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 20),

                // Champ pour la description de l'action-réaction
                TextField(
                  controller: descriptionController,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 20),

                const Text('Action',
                    style:
                        TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),

                actionChoose!, // ##ActionChoose##

                const SizedBox(height: 20),

                const Divider(
                  height: 30,
                  color: Colors.black,
                  thickness: 2,
                  indent: 10,
                  endIndent: 10,
                ),

                const SizedBox(height: 20),

                const Text('Réactions',
                    style:
                        TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),

                const SizedBox(height: 20),
                // Liste de réactions avec possibilité d'en ajouter
                reactionChoose!, // ##ReactionsChoose##
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () {
                if (nameController.text.isNotEmpty &&
                    descriptionController.text.isNotEmpty) {
                  // Récupérer les données de l'action
                  ActionModel? action = actionChoose!.getAction();
                  List<Reaction?> reactions = reactionChoose!.getReactions();

                  if (action == null || reactions.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                            'Veuillez sélectionner une action et au moins une réaction'),
                      ),
                    );
                    return;
                  }
                  // Créer la zone
                  areaService
                      .createArea(nameController.text,
                          descriptionController.text, action, reactions)
                      .then((value) {
                    setState(() {
                      areasFuture = areaService.getAreas();
                    });
                  });

                  Navigator.of(context).pop();
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                          'Veuillez remplir tous les champs, sélectionner une action et au moins une réaction'),
                    ),
                  );
                }
              },
              child: const Text('Valider'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const MyAppBar(),
      body: Column(
        children: [
          _buildAnimatedHeader(), // En-tête animé ajouté ici
          Expanded(
            child: FutureBuilder<List<Area>>(
              future: areasFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  print(snapshot.error);
                  return const Center(
                      child: Text(
                          'Aucune area disponible: Une erreur est survenue'));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('Aucune area disponible'));
                } else {
                  return ListView.builder(
                    itemCount: snapshot.data!.length,
                    itemBuilder: (context, index) {
                      final area = snapshot.data![index];
                      return GestureDetector(
                        onTap: () =>
                            _showAreaDetailsDialog(area), // Ouvre le pop-up
                        child: Card(
                          elevation: 3,
                          margin: const EdgeInsets.symmetric(vertical: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        area.name,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    Expanded(
                                      child: Text(
                                        area.createdAt,
                                        overflow: TextOverflow.ellipsis,
                                        style:
                                            const TextStyle(color: Colors.grey),
                                      ),
                                    ),
                                    Expanded(
                                      child: Row(
                                        children: [
                                          Text(
                                            area.status == true
                                                ? 'Active'
                                                : 'Inactive',
                                            style: TextStyle(
                                              color: area.status == true
                                                  ? Colors.green
                                                  : Colors.grey,
                                            ),
                                          ),
                                          const SizedBox(width: 5),
                                          Icon(
                                            Icons.circle,
                                            color: area.status == true
                                                ? Colors.green
                                                : Colors.grey,
                                            size: 12,
                                          ),
                                        ],
                                      ),
                                    ),
                                    Expanded(
                                      child: IconButton(
                                        icon: const Icon(Icons.delete),
                                        onPressed: () {
                                          areaService
                                              .deleteArea(area.id)
                                              .then((value) {
                                            setState(() {
                                              areasFuture =
                                                  areaService.getAreas();
                                            });
                                          });
                                        },
                                      ),
                                    ),
                                    Expanded(
                                      child: IconButton(
                                        icon: Icon(area.status == true
                                            ? Icons.pause
                                            : Icons.play_arrow),
                                        onPressed: () {
                                          if (area.status == true) {
                                            areaService
                                                .disableArea(area.id)
                                                .then((value) {
                                              setState(() {
                                                areasFuture =
                                                    areaService.getAreas();
                                              });
                                            });
                                          } else {
                                            areaService
                                                .enableArea(area.id)
                                                .then((value) {
                                              setState(() {
                                                areasFuture =
                                                    areaService.getAreas();
                                              });
                                            });
                                          }
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  );
                }
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openCreateDialog,
        backgroundColor: Colors.blue,
        child: const Icon(Icons.add),
      ),
    );
  }
}
