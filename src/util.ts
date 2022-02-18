import { doc, Firestore, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { userConverter, UserDocument } from './types/UserDocument';

async function createUsername(displayName: string | null | undefined, db: Firestore) {
  const defaultTag = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  let username = `Anonymous${defaultTag}`;
  if (!(displayName === undefined || displayName === null)) {
    const tokens = displayName.split(' ');
    if (tokens.length < 2) {
      username = displayName;
    } else {
      username = `${tokens[0]}${tokens[1].charAt(0)}`;
    }
  }

  let tag = await getTag(username, db);
  // Username by itself is currently at capacity
  // There should effectively never be a collision after appending to the username
  if (!tag) {
    username = `${username}${defaultTag}`;
    tag = await getTag(username, db) ?? '0000';
  }

  return { username: username, tag: tag };
}

async function updateUsername(newUsername: string, user: UserDocument, db: Firestore): Promise<string | undefined> {
  const originalName = user.name;
  const originalTagIndex = parseInt(user.lobbyId, 10);
  const tag = await getTag(newUsername, db);
  if (!tag) {
    return 'Username in use by too many people. Select another.';
  } else {
    // Update old username tags
    const oldTagsRef = await getDoc(doc(db, 'tags', originalName));
    const oldTags = oldTagsRef.data()?.tags ?? [];
    oldTags[originalTagIndex] = false;
    await setDoc(doc(db, 'tags', originalName), {
      tags: oldTags
    });

    // Update user's own info
    await updateDoc(doc(db, 'users', user.userDocId).withConverter(userConverter), {
      name: newUsername,
      lobbyId: tag
    });
    return undefined;
  }
};

async function getTag(username: string, db: Firestore): Promise<string | undefined> {
  const tagLimit = 10000;
  let tag = 0;  // default if username does not exist yet
  let tags: boolean[] = [true];  // default if username does not exist yet

  const tagRef = doc(db, 'tags', username);
  const tagSnap = await getDoc(tagRef);

  if (tagSnap.exists()) {
    tags = tagSnap.data().tags;
    if (tags.filter((t: boolean) => t === true).length >= tagLimit) {
      // Username is at capacity
      return undefined;
    } else if (tags.filter((t: boolean) => t === false).length === 0) {
      // All generated tags are currently in use
      tag = tags.length;
      tags.push(true);
    } else {
      tag = tags.indexOf(false);
      tags[tag] = true;
    }
  }
  await setDoc(doc(db, 'tags', username), {
    tags: tags
  });
  return Math.floor(tag).toString().padStart(4, '0');
}

export { createUsername, updateUsername };
