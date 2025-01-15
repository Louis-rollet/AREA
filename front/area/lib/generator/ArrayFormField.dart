import 'package:flutter/material.dart';
import 'FormFieldModel.dart';

class ArrayFormField extends StatefulWidget {
  final FormFieldModel field;

  const ArrayFormField({super.key, required this.field});

  @override
  _ArrayFormFieldState createState() => _ArrayFormFieldState();
}

class _ArrayFormFieldState extends State<ArrayFormField> {
  List<TextEditingController> controllers = [];

  @override
  void initState() {
    super.initState();
  }

  void _addController() {
    final controller = TextEditingController();
    controller.addListener(_updateFieldController);
    setState(() {
      controllers.add(controller);
    });
  }

  void _removeController(int index) {
    setState(() {
      controllers[index].removeListener(_updateFieldController);
      controllers[index].dispose();
      controllers.removeAt(index);
    });
    _updateFieldController();
  }

  void _updateFieldController() {
    // Concaténer les valeurs des contrôleurs avec un espace entre chaque
    final concatenatedValue = controllers.map((c) => c.text).join(' ');
    widget.field.controller?.text = concatenatedValue;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        Align(
          alignment: Alignment.centerLeft,
          child: Text(
            widget.field.label,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 4),
        SingleChildScrollView(
          child: Column(
            children: [
              ...controllers.asMap().entries.map((entry) {
                int index = entry.key;
                TextEditingController controller = entry.value;
                return Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: controller,
                        decoration: InputDecoration(
                          hintText: widget.field.placeholder,
                        ),
                        keyboardType: TextInputType.text,
                        validator: (value) {
                          if (widget.field.required &&
                              (value == null || value.isEmpty)) {
                            return '${widget.field.label} is required';
                          }
                          if (widget.field.validation != null) {
                            final regex =
                                RegExp(widget.field.validation!['regex']);
                            if (!regex.hasMatch(value!)) {
                              return widget.field.validation!['error_message'];
                            }
                          }
                          return null;
                        },
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete),
                      onPressed: () {
                        if (controllers.isNotEmpty) {
                          _removeController(index);
                        }
                      },
                    ),
                  ],
                );
              }),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: _addController,
                child: Text('Add ${widget.field.label}'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    for (var controller in controllers) {
      controller.removeListener(_updateFieldController);
      controller.dispose();
    }
    super.dispose();
  }
}
