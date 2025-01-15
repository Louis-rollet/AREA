import 'dart:convert';
import 'package:flutter/material.dart';

class JsonDisplayDialog extends StatefulWidget {
  final String? jsonString;
  final double? pos_x;
  final double? pos_y;

  const JsonDisplayDialog(
      {super.key,
      required this.jsonString,
      required this.pos_x,
      required this.pos_y});

  @override
  _JsonDisplayDialogState createState() => _JsonDisplayDialogState();
}

class _JsonDisplayDialogState extends State<JsonDisplayDialog> {
  bool _isJsonVisible = false;
  OverlayEntry? _overlayEntry;

  void _toggleJsonDisplay() {
    setState(() {
      _isJsonVisible = !_isJsonVisible;
    });

    if (_isJsonVisible) {
      _showOverlay();
    } else {
      _removeOverlay();
    }
  }

  void _showOverlay() {
    if (_overlayEntry == null) {
      _overlayEntry = _createOverlayEntry();
      Overlay.of(context).insert(_overlayEntry!);
    }
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  OverlayEntry _createOverlayEntry() {
    List<dynamic> jsonData;
    try {
      jsonData =
          widget.jsonString != null ? jsonDecode(widget.jsonString!) : [];
    } catch (e) {
      jsonData = [];
    }

    // final RenderBox renderBox =
    //     _iconKey.currentContext?.findRenderObject() as RenderBox;
    // final Offset position = renderBox.localToGlobal(Offset.zero);

    return OverlayEntry(
      builder: (context) => Positioned(
        top: widget.pos_y! + 50,
        right: widget.pos_x,
        child: Material(
          elevation: 5,
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                    const Text(
                        "Données à récuperer de l'action vers la réaction:")
                  ] +
                  jsonData.map((item) {
                    if (item is Map<String, dynamic>) {
                      var name = item['name'];
                      var accessibleAs = item['accessible_as'];
                      return Text(
                        "$accessibleAs = $name",
                        style: const TextStyle(fontSize: 16),
                      );
                    } else {
                      return const Text(
                        "Format d'élément incorrect dans la liste JSON.",
                        style: TextStyle(color: Colors.white),
                      );
                    }
                  }).toList(),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _removeOverlay(); // Supprime l'overlay si toujours présent
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        MouseRegion(
          onEnter: (_) => _showOverlay(),
          onExit: (_) => _removeOverlay(),
          child: IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: _toggleJsonDisplay,
          ),
        ),
      ],
    );
  }
}
