import 'package:flutter/material.dart';

class FormFieldModel {
  final String name;
  final String label;
  final String type;
  final bool required;
  final String placeholder;
  final dynamic defaultValue;
  final Map<String, dynamic>? validation;
  final Map<String, dynamic>?
      extraConfig; // Pour des configurations spécifiques au champ
  TextEditingController? controller;

  FormFieldModel({
    required this.name,
    required this.label,
    required this.type,
    required this.required,
    required this.placeholder,
    this.defaultValue,
    this.validation,
    this.extraConfig,
    this.controller,
  });

  factory FormFieldModel.fromJson(Map<String, dynamic> json) {
    return FormFieldModel(
      name: json['name'],
      label: json['label'],
      type: json['type'],
      required: json['required'] ?? false,
      placeholder: json['placeholder'] ?? '',
      defaultValue: json['defaultValue'],
      validation: json['validation'],
      extraConfig: json['extraConfig'],
    );
  }
}
