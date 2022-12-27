/* eslint-disable */
import type { FC } from 'react';
import React, {
  useCallback, useEffect, useRef, memo,
} from 'react';
import { getGlobal } from './global';

import type { ApiUser } from './types';

import buildClassName from './util/buildClassName';
import setTooltipItemVisible from './util/setTooltipItemVisible';
import usePrevious from './hooks/usePrevious';
import useShowTransition from './hooks/useShowTransition';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { usersById } from './index'


import './Tooltip.css';

export type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
  onInsertUserName: (user: ApiUser, forceFocus?: boolean) => void;
  filteredUsers?: ApiUser[];
};

const MentionTooltip:any = ({
  isOpen,
  onClose,
  onInsertUserName,
  filteredUsers,
}: OwnProps) => {
  // eslint-disable-next-line no-null/no-null
  const containerRef = useRef<HTMLDivElement>(null);
  // const { shouldRender, transitionClassNames } = useShowTransition(isOpen, undefined, undefined, false);

  const handleUserSelect = useCallback((userId: string, forceFocus = false) => {
    // No need for expensive global updates on users, so we avoid them
    // const usersById = getGlobal().users.byId;
    // @ts-ignore
    const user = usersById[userId];
    if (!user) {
      return;
    }

    onInsertUserName(user, forceFocus);
  }, [onInsertUserName]);

  const handleSelectMention = useCallback((member: ApiUser) => {
    handleUserSelect(member.id, true);
  }, [handleUserSelect]);

  const selectedMentionIndex = useKeyboardNavigation({
    isActive: isOpen,
    items: filteredUsers,
    onSelect: handleSelectMention,
    shouldSelectOnTab: true,
    shouldSaveSelectionOnUpdateItems: true,
    onClose,
  });

  useEffect(() => {
    setTooltipItemVisible('.chat-item-clickable', selectedMentionIndex, containerRef);
  }, [selectedMentionIndex]);

  useEffect(() => {
    if (filteredUsers && !filteredUsers.length) {
      onClose();
    }
  }, [filteredUsers, onClose]);

  const prevChatMembers = usePrevious(
    filteredUsers?.length
      ? filteredUsers
      : undefined,
  );
  const renderedChatMembers = filteredUsers && !filteredUsers.length
    ? prevChatMembers
    : filteredUsers;

  if ( (renderedChatMembers && !renderedChatMembers.length)) {
    return undefined;
  }

  const className = buildClassName(
    'MentionTooltip',
  );

  return (
    <div className={className} ref={containerRef}>
      {isOpen && renderedChatMembers?.map(({ id, firstName }, index) => (
        <div key={id} onClick={() => handleUserSelect(id)} className={selectedMentionIndex === index ? 'active' : ''}>
          <div>{firstName}</div>
        </div>
      ))}
    </div>
  );
};

export default memo(MentionTooltip);
