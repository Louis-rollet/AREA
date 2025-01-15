import 'package:flutter/material.dart';
import 'FormFieldModel.dart';
import 'ArrayFormField.dart';

Widget generateFieldWidget(FormFieldModel field) {
  switch (field.type) {
    case 'string':
      return TextFormField(
        decoration: InputDecoration(
          labelText: field.label,
          hintText: field.placeholder,
        ),
        initialValue: field.defaultValue?.toString(),
        controller: field.controller,
        validator: (value) {
          if (field.required && (value == null || value.isEmpty)) {
            return '${field.label} is required';
          }
          if (field.required &&
              field.validation != null &&
              !RegExp(field.validation!['regex']).hasMatch(value!)) {
            return field.validation!['error_message'];
          }
          return null;
        },
      );
    case 'text':
      return TextFormField(
        decoration: InputDecoration(
          labelText: field.label,
          hintText: field.placeholder,
        ),
        initialValue: field.defaultValue?.toString(),
        controller: field.controller,
        validator: (value) {
          if (field.required && (value == null || value.isEmpty)) {
            return '${field.label} is required';
          }
          if (field.required &&
              field.validation != null &&
              !RegExp(field.validation!['regex']).hasMatch(value!)) {
            return field.validation!['error_message'];
          }
          return null;
        },
      );
    case 'email':
      return TextFormField(
        decoration: InputDecoration(
          labelText: field.label,
          hintText: field.placeholder,
        ),
        initialValue: field.defaultValue?.toString(),
        keyboardType: TextInputType.emailAddress,
        controller: field.controller,
        validator: (value) {
          if (field.required && (value == null || value.isEmpty)) {
            return '${field.label} is required';
          }
          if (field.required &&
              field.validation != null &&
              !RegExp(field.validation!['regex']).hasMatch(value!)) {
            return field.validation!['error_message'];
          }
          return null;
        },
      );
    case 'textarea':
      return TextFormField(
        maxLines: field.extraConfig?['maxLines'] ?? 5,
        decoration: InputDecoration(
          labelText: field.label,
          hintText: field.placeholder,
        ),
        initialValue: field.defaultValue?.toString(),
        controller: field.controller,
        validator: (value) {
          if (field.required && (value == null || value.isEmpty)) {
            return '${field.label} is required';
          }
          return null;
        },
      );
    case 'number':
      return TextFormField(
        decoration: InputDecoration(
          labelText: field.label,
          hintText: field.placeholder,
        ),
        initialValue: field.defaultValue?.toString(),
        keyboardType: TextInputType.number,
        controller: field.controller,
        validator: (value) {
          if (field.required && (value == null || value.isEmpty)) {
            return '${field.label} is required';
          }
          return null;
        },
      );

    case 'array':
      return ArrayFormField(field: field);
    // Ajoutez d'autres types ici, comme un 'date' picker, 'checkbox', 'radio button', etc.
    default:
      return const SizedBox.shrink(); // Pour les types non pris en charge
  }
}
