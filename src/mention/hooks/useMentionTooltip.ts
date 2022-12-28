import {
  useCallback, useEffect, useState,
} from 'react';
import type { ApiChatMember, ApiUser } from '../types';
import { ApiMessageEntityTypes } from '../types';

import { filterUsersByName, getMainUsername, getUserFirstOrLastName } from '../global/users';
import { prepareForRegExp } from '../helper/prepareForRegExp';
import focusEditableElement from '../util/focusEditableElement';
import { pickTruthy, unique } from '../util/iteratees';
import { throttle } from '../util/schedulers';
import { getHtmlBeforeSelection } from '../util/selection';

import useFlag from '../hooks/useFlag';
import useCacheBuster from '../hooks/useCacheBuster';
import useOnSelectionChange from '../hooks/useOnSelectionChange';
import { usersById } from '../index'
import { EDITABLE_INPUT_CSS_SELECTOR } from '../environment'

const runThrottled = throttle((cb) => cb(), 500, true);
let RE_USERNAME_SEARCH: RegExp;

try {
  RE_USERNAME_SEARCH = /(^|\s)@[-_\p{L}\p{M}\p{N}]*$/gui;
} catch (e) {
  // Support for older versions of firefox
  RE_USERNAME_SEARCH = /(^|\s)@[-_\d\wа-яё]*$/gi;
}

const inputSelector = EDITABLE_INPUT_CSS_SELECTOR

export default function useMentionTooltip(
  onUpdateHtml: (html: string) => void,
  groupChatMembers?: ApiChatMember[],
  currentUserId?: string,
) {
  const [isOpen, markIsOpen, unmarkIsOpen] = useFlag();
  const [htmlBeforeSelection, setHtmlBeforeSelection] = useState('');
  const [usersToMention, setUsersToMention] = useState<ApiUser[] | undefined>();

  const updateFilteredUsers = useCallback((filter:any, withInlineBots: boolean) => {

    if (!usersById) {
      setUsersToMention(undefined);
      return;
    }

    runThrottled(() => {
      const memberIds = groupChatMembers?.reduce((acc: string[], member) => {
        if (member.userId !== currentUserId) {
          acc.push(member.userId);
        }
        return acc;
      }, []);

      const filteredIds = filterUsersByName(unique([
        ...(memberIds || []),
      ]), usersById, filter);

      // @ts-ignore
      setUsersToMention(Object.values(pickTruthy(usersById, filteredIds)));
    });
  }, [currentUserId, groupChatMembers,]);

  const [cacheBuster, updateCacheBuster] = useCacheBuster();

  const handleSelectionChange = useCallback((range: Range) => {
    if (range.collapsed) {
      updateCacheBuster(); // Update tooltip on cursor move
    }
  }, [updateCacheBuster]);

  useOnSelectionChange(document.querySelector<HTMLDivElement>(inputSelector), handleSelectionChange);

  useEffect(() => {
    setHtmlBeforeSelection(getHtmlBeforeSelection(document.querySelector<HTMLDivElement>(inputSelector)!));
  }, [inputSelector, cacheBuster]);

  useEffect(() => {
    if (!htmlBeforeSelection.length) {
      unmarkIsOpen();
      return;
    }

    const usernameFilter = htmlBeforeSelection.includes('@') && getUsernameFilter(htmlBeforeSelection);

    if (usernameFilter) {
      const filter = usernameFilter ? usernameFilter.substr(1) : '';

      updateFilteredUsers(filter, canSuggestInlineBots(htmlBeforeSelection));
    } else {
      unmarkIsOpen();
    }
  }, [updateFilteredUsers, markIsOpen, unmarkIsOpen, htmlBeforeSelection]);

  useEffect(() => {
    if (usersToMention?.length) {
      markIsOpen();
    } else {
      unmarkIsOpen();
    }
  }, [markIsOpen, unmarkIsOpen, usersToMention]);

  const insertMention = useCallback((user: ApiUser, forceFocus = false) => {
    if (!user.usernames && !getUserFirstOrLastName(user)) {
      return;
    }

    const mainUsername = getMainUsername(user);
    const insertedHtml = !mainUsername
      ? `@${mainUsername}`
      : `<a
          class="text-entity-link"
          data-entity-type="${ApiMessageEntityTypes.MentionName}"
          data-user-id="${user.id}"
          contenteditable="false"
          dir="auto"
        >${getUserFirstOrLastName(user)}</a>`;

    const containerEl = document.querySelector<HTMLDivElement>(inputSelector)!;

    const atIndex = htmlBeforeSelection.lastIndexOf('@');
    if (atIndex !== -1) {
      const newHtml = `${htmlBeforeSelection.substr(0, atIndex)}${insertedHtml}&nbsp;`;
      const htmlAfterSelection = containerEl.innerHTML.substring(htmlBeforeSelection.length);
      onUpdateHtml(`${newHtml}${htmlAfterSelection}`);

      requestAnimationFrame(() => {
        focusEditableElement(containerEl, forceFocus);
      });
    }

    unmarkIsOpen();
  }, [htmlBeforeSelection, inputSelector, onUpdateHtml, unmarkIsOpen]);


  return {
    isMentionTooltipOpen: isOpen,
    closeMentionTooltip: unmarkIsOpen,
    insertMention,
    mentionFilteredUsers: usersToMention,
  };
}

function getUsernameFilter(html: string) {
  const username = prepareForRegExp(html).match(RE_USERNAME_SEARCH);
  return username ? username[0].trim() : undefined;
}

function canSuggestInlineBots(html: string) {
  return html.startsWith('@');
}
