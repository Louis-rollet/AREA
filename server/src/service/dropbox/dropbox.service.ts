/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class DropboxService {
  constructor(
    private prismaService: PrismaService,
  ) {}

  async getDropboxToken(userId: string) {

    userId = "dropbox|" + userId;
    
    const tokens = await this.prismaService.token.findMany({
      where: {
        user_id: userId,
      },
    });

    if (tokens.length === 0) {
      throw new Error('User not found');
    }

    return tokens[0].access_token.toString();
  };

  async dropboxGetCursorListFolder(userToken: string): Promise<string> {
    const result = await fetch('https://api.dropboxapi.com/2/files/list_folder/get_latest_cursor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + userToken,
        },
        body: JSON.stringify({
            "include_deleted": true,
            "include_has_explicit_shared_members": false,
            "include_media_info": false,
            "include_mounted_folders": true,
            "include_non_downloadable_files": true,
            "path": "",
            "recursive": true
        }),
    });

    const body = await result.json();
    return body["cursor"];
  }
  
  async dropboxListFolderContinue(signature: string, userId: string, cursor: string) {
    const userToken = await this.getDropboxToken(userId);

    console.log("Signature: ", signature);

    console.log("UserToken: ", userToken);

    console.log("Cursor: ", cursor);
    
    const result = await fetch('https://api.dropboxapi.com/2/files/list_folder/continue', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-dropbox-signature': signature,
            Authorization: 'Bearer ' + userToken,
        },
        body: JSON.stringify({
            cursor: cursor,
        }),
    });
    const body = await result.json();
    console.log(body);
    return body;
  }

  validationForLauchFunctionForArea(params: any, entries: any): boolean {

    if (entries.length === 0) {
      return false;
    }
    
    for (const entry of entries) {
      if (params.pathtocheck && params.pathtocheck !== '' && entry["path_lower"].startsWith(params.pathtocheck)) {
        if (params.type === entry[".tag"]) {
          return true;
        }
      }
    }
    return false;
  }

  async dropboxMove(userToken: string, from: string, to: string) {
    console.log("from: ", from);
    console.log("to: ", to);
    console.log("userToken: ", userToken);
    const result = await fetch('https://api.dropboxapi.com/2/files/move_v2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + userToken,
        },
        body: JSON.stringify({
          "allow_ownership_transfer": false,
          "allow_shared_folder": false,
          "autorename": true,
          "from_path": from,
          "to_path": to
      }),
    });
    console.log(result);
    return result;
  }

  async dropboxDelete(userToken: string, path: string) {
    const result = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + userToken,
        },
        body: JSON.stringify(
          {
            "path": path
        }),
    });
    return result;
  }
}