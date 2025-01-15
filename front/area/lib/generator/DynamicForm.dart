import 'package:flutter/material.dart';
import 'FormFieldModel.dart';
import 'FormComponentGenerator.dart';

class DynamicForm extends StatefulWidget {
  final List<FormFieldModel> fields;

  const DynamicForm({super.key, required this.fields});

  @override
  DynamicFormState createState() => DynamicFormState();
}

class DynamicFormState extends State<DynamicForm> {
  final _formKey = GlobalKey<FormState>();
  Map<String, TextEditingController> data_temp = {};
  Map<String, String> final_data = {};

  @override
  void initState() {
    super.initState();
    // Initialisation des contrôleurs pour chaque champ
  }

  // Méthode pour valider le formulaire et mettre à jour les données
  bool validateAndSave() {
    if (_formKey.currentState!.validate()) {
      return true;
    }
    return false;
  }

  @override
  void dispose() {
    // Libérer les ressources des contrôleurs
    for (var controller in data_temp.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          ...widget.fields.map((field) => generateFieldWidget(field)),
        ],
      ),
    );
  }
}
