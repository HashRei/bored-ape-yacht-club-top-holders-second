import {
  Transfer as TransferEvent,
  Token as TokenContract,
} from "../generated/Token/Token";

import { Token, User } from "../generated/schema";
import { ipfs, json } from "@graphprotocol/graph-ts";

const ipfshash = "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq";

export function handleTransfer(event: TransferEvent): void {
  let token = Token.load(event.params.tokenId.toString());
  if (!token) {
    token = new Token(event.params.tokenId.toString());
    token.tokenID = event.params.tokenId;
    token.tokenURI = "/" + event.params.tokenId.toString();

    let metadata = ipfs.cat(ipfshash + token.tokenURI); // Gives the possibility to read the data from ipfs and hold that information

    if (metadata) {
      const value = json.fromBytes(metadata).toObject();

      if (value) {
        const image = value.get("image");

        if (image) {
          token.image = image.toString();
          token.ipfsURI = "ipfs.io/ipfs/" + ipfshash + token.tokenURI;
        }
      }
    }
  }
  token.updatedAtTimestamp = event.block.timestamp;
  token.owner = event.params.to.toHexString();
  token.save();

  let user = User.load(event.params.to.toHexString());
  if (!user) {
    user = new User(event.params.to.toHexString());
    user.save();
  }
}
