import 'package:flutter/material.dart';
import 'package:tuple/tuple.dart';
import 'services/areaservice.dart';
import 'generator/FormFieldModel.dart';
import 'dart:convert';
import 'generator/DynamicForm.dart';

class ReactionsChoose extends StatefulWidget {
  final Future<List<Reaction>> reactionsFuture;
  List<Reaction?> reactions = [];

  ReactionsChoose({super.key, required this.reactionsFuture});

  @override
  _ReactionsChooseState createState() => _ReactionsChooseState();

  List<Reaction?> getReactions() {
    return reactions;
  }
}

class _ReactionsChooseState extends State<ReactionsChoose> {
  List<Tuple2<String, int>?> selectedReactions = [];
  final GlobalKey<DynamicFormState> _formKey = GlobalKey<DynamicFormState>();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ...List.generate(selectedReactions.length, (index) {
          final selectedReaction = selectedReactions[index];
          final createdReaction =
              widget.reactions.length > index ? widget.reactions[index] : null;

          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: FutureBuilder<List<Reaction>>(
              future: widget.reactionsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const CircularProgressIndicator();
                } else if (snapshot.hasError) {
                  return const Text('Erreur de chargement des réactions');
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Text('Aucune réaction disponible');
                } else {
                  // Vérifier si une réaction a été créée
                  if (createdReaction != null) {
                    // Afficher la réaction créée avec l'option de modification
                    return Row(
                      children: [
                        Expanded(
                          child: Text(
                            '${createdReaction.name} (Réaction ajoutée)',
                            style: const TextStyle(fontSize: 16),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.edit),
                          onPressed: () {
                            // Permettre à l'utilisateur de modifier la réaction
                            setState(() {
                              widget.reactions[index] = null;
                            });
                          },
                        ),
                      ],
                    );
                  } else {
                    // Afficher le dropdown si aucune réaction n'a été créée
                    return DropdownButtonFormField<Tuple2<String, int>>(
                      value: selectedReaction,
                      hint: const Text('Choisir une réaction'),
                      onChanged: (Tuple2<String, int>? newValue) async {
                        if (newValue != null) {
                          Reaction reaction = snapshot.data!.firstWhere(
                            (reaction) => reaction.id == newValue.item2,
                          );

                          Reaction? configuredReaction =
                              await _openDialogConfigureReaction(reaction);

                          if (configuredReaction != null) {
                            setState(() {
                              selectedReactions[index] = newValue;
                              if (widget.reactions.length <= index) {
                                widget.reactions.add(configuredReaction);
                              } else {
                                widget.reactions[index] = configuredReaction;
                              }
                            });
                          }
                        }
                      },
                      items: snapshot.data!
                          .map<DropdownMenuItem<Tuple2<String, int>>>(
                              (reaction) {
                        return DropdownMenuItem<Tuple2<String, int>>(
                          value: Tuple2(reaction.name, reaction.id),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Image.network(
                                reaction.icon,
                                width: 24,
                                height: 24,
                              ),
                              Flexible(
                                fit: FlexFit.loose,
                                child: Text(
                                  reaction.name,
                                  overflow: TextOverflow.visible,
                                  maxLines: 2,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    );
                  }
                }
              },
            ),
          );
        }),

        // Bouton pour ajouter une nouvelle réaction
        IconButton(
          icon: const Icon(Icons.add),
          onPressed: () {
            setState(() {
              selectedReactions.add(null);
              widget.reactions.add(null);
            });
          },
        ),
      ],
    );
  }

  Future<Reaction?> _openDialogConfigureReaction(Reaction reaction) async {
    String newReactionName = '';
    String newReactionDescription = '';

    final result = await showDialog<Reaction>(
      context: context,
      builder: (BuildContext context) {
        List<dynamic> jsonData = jsonDecode(reaction.parameters ?? '[]');
        Map<String, TextEditingController> dataTemp = {};
        Map<String, String> finalData = {};

        List<Map<String, dynamic>> parameters =
            List<Map<String, dynamic>>.from(jsonData);

        List<FormFieldModel> fields = parameters
            .map((fieldJson) => FormFieldModel.fromJson(fieldJson))
            .toList();

        for (var field in fields) {
          dataTemp[field.name] = TextEditingController(text: '');
          field.controller = dataTemp[field.name];
        }

        TextEditingController nameController =
            TextEditingController(text: newReactionName);
        TextEditingController descriptionController =
            TextEditingController(text: newReactionDescription);

        return Dialog(
          child: Material(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(
                      controller: nameController,
                      decoration: const InputDecoration(
                        labelText: "Name",
                        hintText: "Enter reaction name",
                      ),
                    ),
                    const SizedBox(height: 16.0),
                    TextFormField(
                      controller: descriptionController,
                      decoration: const InputDecoration(
                        labelText: "Description",
                        hintText: "Enter reaction description",
                      ),
                    ),
                    const SizedBox(height: 24.0),
                    DynamicForm(
                      fields: fields,
                      key: _formKey,
                    ),
                    const SizedBox(height: 24.0),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).pop();
                          },
                          child: const Text("Cancel"),
                        ),
                        ElevatedButton(
                          onPressed: () {
                            if (_formKey.currentState!.validateAndSave()) {
                              String nameValue = nameController.text;
                              String descriptionValue =
                                  descriptionController.text;

                              for (var field in fields) {
                                finalData[field.name] = field.controller!.text;
                              }

                              Navigator.of(context).pop(Reaction(
                                  id: reaction.id,
                                  name: nameValue,
                                  description: descriptionValue,
                                  serviceId: reaction.serviceId,
                                  parameters: jsonEncode(finalData)));
                            } else {
                              print("Form is not valid");
                            }
                          },
                          child: const Text("Save"),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );

    return result;
  }
}
