export const AnalyticsEvents = {
    RegisterSuccess: 'REGISTER_SUCCESS',
    LoginSuccess: 'LOGIN_SUCCESS',
    CollectionCreated: 'COLLECTION_CREATED',
    CollectionPublished: 'COLLECTION_PUBLISHED',
    CollectionUnpublished: 'COLLECTION_UNPUBLISHED',
    CollectionViewed: 'COLLECTION_VIEWED',
    CollectionForked: 'COLLECTION_FORKED',
    CardCreated: 'CARD_CREATED',
    AiCardsGenerated: 'AI_CARDS_GENERATED',
    ReviewStarted: 'REVIEW_STARTED',
    ReviewCardAnswered: 'REVIEW_CARD_ANSWERED',
    ReviewFinished: 'REVIEW_FINISHED'
} as const;

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];
