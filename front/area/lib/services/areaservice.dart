import 'dart:convert';
import '../interceptors/httpinterceptor.dart';

class AreaService {
  final HttpInterceptor http = HttpInterceptor();
  final String baseUrl = 'https://api.louis.yt';

  // Méthode pour récupérer les réactions disponibles
  Future<List<Reaction>> getReactions() async {
    final response = await http.get('$baseUrl/action-reaction/Reaction');

    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((reaction) => Reaction.fromJson(reaction)).toList();
    } else {
      throw Exception('Erreur lors de la récupération des réactions');
    }
  }

  // Méthode pour récupérer les actions
  Future<List<ActionModel>> getActions() async {
    final response = await http.get('$baseUrl/action-reaction/Action');

    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((action) => ActionModel.fromJson(action)).toList();
    } else {
      throw Exception('Erreur lors de la récupération des actions');
    }
  }

  Future<List<Area>> getAreas() async {
    final response = await http.get('$baseUrl/action-reaction/Area');

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = json.decode(response.body);

      // Access the list of areas under the "area" key
      if (data.containsKey('area') && data['area'] is List) {
        return (data['area'] as List)
            .map((areaJson) => Area.fromJson(areaJson))
            .toList();
      } else {
        throw Exception(
            'Format de données incorrect : Liste d\'areas non trouvée');
      }
    } else {
      throw Exception('Erreur lors de la récupération des zones');
    }
  }

  // Méthode pour créer une zone
  Future<void> createArea(String name, String description, ActionModel action,
      List<Reaction?> reaction) async {
    final response = await http.post(
      '$baseUrl/action-reaction/Area',
      {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      jsonEncode(<String, dynamic>{
        'name': name,
        'description': description,
        'id_action': action.id,
        'ids_reaction': [
          for (var r in reaction) {'id': r?.id, 'parameters': r?.parameters}
        ],
        'parameters': action.parameters,
      }),
    );

    if (response.statusCode != 201) {
      throw Exception('Erreur lors de la création de la zone');
    }
  }

  Future<void> enableArea(int areaId) async {
    final response = await http.put(
      '$baseUrl/action-reaction/Area/$areaId',
      {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      jsonEncode(<String, dynamic>{
        'status': 1,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Erreur lors de l\'activation de la zone');
    }
  }

  Future<void> disableArea(int areaId) async {
    final response = await http.put(
      '$baseUrl/action-reaction/Area/$areaId',
      {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      jsonEncode(<String, dynamic>{
        'status': 0,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Erreur lors de la désactivation de la zone');
    }
  }

  // Méthode pour supprimer une zone
  Future<void> deleteArea(int areaId) async {
    final response =
        await http.delete('$baseUrl/action-reaction/Area/$areaId', null, null);

    if (response.statusCode != 200) {
      throw Exception('Erreur lors de la suppression de la zone');
    }
  }

  Future<List<Reaction>> getReactionsForArea(int areaId) async {
    List<Reaction> allReactions = await getReactions();
    Map<int, String> reactionNames = {
      for (var reaction in allReactions) reaction.id: reaction.name
    };

    final areaReactionsResponse =
        await http.get('$baseUrl/action-reaction/Area/Reaction');
    if (areaReactionsResponse.statusCode != 200) {
      throw Exception(
          'Erreur lors de la récupération des associations de réactions');
    }

    final Map<String, dynamic> decodedResponse =
        json.decode(areaReactionsResponse.body);
    List<dynamic> areaReactionsList = decodedResponse['area_reactions'];

    List<Map<String, dynamic>> associatedReactions = areaReactionsList
        .where((association) => association['area_id'] == areaId)
        .map((association) => association as Map<String, dynamic>)
        .toList();

    List<Reaction> reactions = associatedReactions.map((association) {
      String parametersString = association['parameters'];
      Map<String, dynamic>? parametersMap;

      try {
        String innerJsonString = json.decode(parametersString);
        parametersMap = json.decode(innerJsonString);
      } catch (e) {
        print("Erreur de décodage des paramètres : $e");
        parametersMap = null;
      }

      int reactionId = association['reaction_id'];
      String reactionName = reactionNames[reactionId] ?? "Nom inconnu";

      return Reaction(
        id: reactionId,
        name: reactionName,
        serviceId: 1,
        parameters: json.encode(parametersMap),
        description: '',
      );
    }).toList();

    return reactions;
  }

  Future<ActionModel> getActionById(int actionId) async {
    final response =
        await http.get('$baseUrl/action-reaction/Action/$actionId');

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = json.decode(response.body);
      return ActionModel.fromJson(data);
    } else {
      throw Exception('Erreur lors de la récupération de l\'action');
    }
  }
}

// Modèle pour les réactions
class Reaction {
  final int id;
  final String name;
  final String description;
  final int serviceId;
  final String? parameters;
  final String icon;

  Reaction({
    required this.id,
    required this.name,
    required this.description,
    required this.serviceId,
    required this.parameters,
    this.icon = '',
  });

  factory Reaction.fromJson(Map<String, dynamic> json) {
    return Reaction(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      serviceId: json['service_id'],
      parameters: json['parameters'],
      icon: json['icon'] ?? '',
    );
  }

  dynamic get decodedParameters {
    if (parameters == null || parameters!.isEmpty) return null;
    try {
      final decoded = json.decode(parameters!);
      if (decoded is List) {
        return decoded; // Retourne la liste
      } else if (decoded is Map<String, dynamic>) {
        return decoded; // Retourne la map
      } else {
        return null;
      }
    } catch (e) {
      print("Erreur de décodage des paramètres de réaction : $e");
      return null;
    }
  }
}

// Modèle pour les actions
class ActionModel {
  final int id;
  final String name;
  final String description;
  final int serviceId;
  final String parameters;
  final String passable_data;
  final String icon;

  ActionModel(
      {this.id = -1,
      this.name = '',
      this.description = '',
      this.serviceId = -1,
      this.parameters = '',
      this.passable_data = '',
      this.icon = ''});

  factory ActionModel.fromJson(Map<String, dynamic> json) {
    return ActionModel(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      serviceId: json['service_id'],
      parameters: json['parameters'] ?? '',
      passable_data: json['passable_data'] ?? '',
      icon: json['icon'] ?? '',
    );
  }
}

class Area {
  final int id;
  final int actionId;
  final bool status;
  final String name;
  final String createdAt;
  final String userID;
  final String? parameters;
  final String? description;
  final String? last_token_state;

  Area({
    required this.id,
    required this.actionId,
    required this.name,
    required this.userID,
    required this.createdAt,
    required this.status,
    this.parameters,
    this.description,
    this.last_token_state,
  });

  factory Area.fromJson(Map<String, dynamic> json) {
    return Area(
        id: json['id'],
        actionId: json['action_id'],
        name: json['name'],
        createdAt: json['created_at'],
        userID: json['user_id'],
        status: json['status'],
        parameters: json['parameters'] ?? '',
        description: json['description'] ?? '',
        last_token_state: json['last_state_token'] ?? '');
  }
}
