import 'package:flutter/material.dart';
import 'package:tuple/tuple.dart';
import 'services/areaservice.dart';
import 'generator/FormFieldModel.dart';
import 'dart:convert';
import 'generator/DynamicForm.dart';
import 'passable_data.dart';

class ActionChoose extends StatefulWidget {
  final Future<List<ActionModel>> actionsFuture;
  ActionModel? toReturnAction;

  ActionChoose({super.key, required this.actionsFuture, this.toReturnAction});

  @override
  _ActionChooseState createState() => _ActionChooseState();

  ActionModel? getAction() {
    return toReturnAction;
  }
}

class _ActionChooseState extends State<ActionChoose> {
  Tuple2<String, int>? selectedAction;
  ActionModel? createdAction;
  JsonDisplayDialog? jsonDisplayDialog;
  final GlobalKey<DynamicFormState> _formKey = GlobalKey<DynamicFormState>();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Drop-down pour les actions
        FutureBuilder<List<ActionModel>>(
          future: widget.actionsFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const CircularProgressIndicator();
            } else if (snapshot.hasError) {
              return const Text('Erreur de chargement des actions');
            } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return const Text('Aucune action disponible');
            } else {
              if (createdAction != null) {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${createdAction!.name} (Action ajoutée)',
                      style: const TextStyle(fontSize: 16),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit),
                      onPressed: () {
                        // Remettre à zéro l'action créée pour permettre une nouvelle sélection
                        setState(() {
                          createdAction = null;
                        });
                      },
                    ),
                    jsonDisplayDialog = JsonDisplayDialog(
                      jsonString: createdAction!.passable_data,
                      pos_x: context
                              .findRenderObject()
                              ?.getTransformTo(null)
                              .getTranslation()
                              .x ??
                          0,
                      pos_y: context
                              .findRenderObject()
                              ?.getTransformTo(null)
                              .getTranslation()
                              .y ??
                          0,
                    ),
                  ],
                );
              } else {
                return DropdownButtonFormField<Tuple2<String, int>>(
                  value: selectedAction,
                  hint: const Text('Choisir une action'),
                  onChanged: (Tuple2<String, int>? newValue) async {
                    // Récupération de l'action sélectionnée
                    ActionModel action = snapshot.data!.firstWhere(
                      (action) => action.id == newValue!.item2,
                    );

                    // Attendre que l'utilisateur configure l'action
                    createdAction = await _openDialogConfigureAction(action);
                    // Si l'utilisateur a configuré une action, mettre à jour l'état
                    if (createdAction != null) {
                      setState(() {});
                    }
                  },
                  items: snapshot.data!
                      .map<DropdownMenuItem<Tuple2<String, int>>>((action) {
                    return DropdownMenuItem<Tuple2<String, int>>(
                      value: Tuple2(action.name, action.id),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Image.network(
                            action.icon,
                            width: 24,
                            height: 24,
                          ),
                          Flexible(
                            fit: FlexFit.loose,
                            child: Text(
                              action.name,
                              overflow: TextOverflow.visible,
                              maxLines:
                                  2, // Permet jusqu'à 2 lignes si le texte dépasse
                              style: const TextStyle(fontSize: 14),
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
      ],
    );
  }

  Future<ActionModel?> _openDialogConfigureAction(ActionModel action) async {
    String newActionName = '';
    String newActionDescription = '';

    // Utilise await showDialog pour attendre le résultat
    final result = await showDialog<ActionModel>(
      context: context,
      builder: (BuildContext context) {
        List<dynamic> jsonData = jsonDecode(action.parameters);
        Map<String, TextEditingController> dataTemp = {};
        Map<String, String> finalData = {};

        // Extraire la liste des paramètres
        List<Map<String, dynamic>> parameters =
            List<Map<String, dynamic>>.from(jsonData);

        List<FormFieldModel> fields = parameters
            .map((fieldJson) => FormFieldModel.fromJson(fieldJson))
            .toList();

        for (var field in fields) {
          dataTemp[field.name] = TextEditingController(text: '');
          field.controller = dataTemp[field.name];
        }

        // Contrôleurs pour les champs spécifiques à ActionModel
        TextEditingController nameController =
            TextEditingController(text: newActionName);
        TextEditingController descriptionController =
            TextEditingController(text: newActionDescription);

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
                        hintText: "Enter action name",
                      ),
                    ),
                    const SizedBox(height: 16.0),
                    TextFormField(
                      controller: descriptionController,
                      decoration: const InputDecoration(
                        labelText: "Description",
                        hintText: "Enter action description",
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
                            print("Cancel");
                            Navigator.of(context).pop(null);
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

                              widget.toReturnAction = ActionModel(
                                id: action.id,
                                name: nameValue,
                                description: descriptionValue,
                                serviceId: action.serviceId,
                                parameters: jsonEncode(finalData),
                                passable_data: action.passable_data,
                              );

                              // Retourne l'action mise à jour
                              Navigator.of(context).pop(widget.toReturnAction);
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

    // Retourne l'action mise à jour ou l'action originale si annulé
    return result;
  }
}
