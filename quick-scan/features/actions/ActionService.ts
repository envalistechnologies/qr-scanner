/**
 * QuickScan Studio - Action Service Orchestrator
 * Phase 18: Master singleton orchestrating smart action execution, confirmation dialogs, and local storage synchronizations
 */
import { ActionExecutionContext, ActionExecutionResult, ActionId, ConfirmationConfig } from './types';
import { ACTION_REGISTRY } from './ActionRegistry';
import { IntentHandlers } from './IntentHandlers';
import { FavoritesRepository } from '../../storage/repositories/FavoritesRepository';
import { HistoryRepository } from '../../storage/repositories/HistoryRepository';
import { PlatformHandlers } from './PlatformHandlers';

export class ActionService {
  private static instance: ActionService;
  private favoritesRepo: FavoritesRepository;
  private historyRepo: HistoryRepository;

  private constructor() {
    this.favoritesRepo = FavoritesRepository.getInstance();
    this.historyRepo = HistoryRepository.getInstance();
  }

  public static getInstance(): ActionService {
    if (!ActionService.instance) {
      ActionService.instance = new ActionService();
    }
    return ActionService.instance;
  }

  public async executeAction(actionId: ActionId, context: ActionExecutionContext): Promise<ActionExecutionResult> {
    const def = ACTION_REGISTRY[actionId];
    if (!def) {
      return {
        success: false,
        actionId,
        message: `Unrecognized action ID: ${actionId}`,
        errorCode: 'UNKNOWN_ERROR',
      };
    }

    // Check if confirmation dialogue is mandatory
    let requiresPrompt = def.requiresConfirmation;
    let promptConfig = def.confirmationPrompt;

    // Special condition: Toggle Favorite only requests confirmation on REMOVAL (not when adding)
    if (actionId === 'TOGGLE_FAVORITE') {
      requiresPrompt = context.isFavorite === true;
    }

    if (requiresPrompt && promptConfig && context.onConfirmRequest) {
      return new Promise((resolve) => {
        context.onConfirmRequest!(
          promptConfig!,
          () => {
            // User confirmed execution
            resolve(this.dispatchExecution(actionId, context));
          },
          () => {
            // User cancelled confirmation dialogue
            context.onToast?.('Action cancelled by user.', 'info');
            resolve({
              success: false,
              actionId,
              message: 'Action cancelled by user',
              errorCode: 'USER_CANCELLED',
              wasCancelled: true,
            });
          }
        );
      });
    }

    return this.dispatchExecution(actionId, context);
  }

  private async dispatchExecution(actionId: ActionId, context: ActionExecutionContext): Promise<ActionExecutionResult> {
    try {
      switch (actionId) {
        case 'COPY_TEXT':
          return await IntentHandlers.executeCopy(context);
        case 'SHARE_CONTENT':
          return await IntentHandlers.executeShare(context);
        case 'OPEN_WEBSITE':
        case 'OPEN_PLAY_STORE':
        case 'OPEN_APP_STORE':
        case 'OPEN_YOUTUBE':
        case 'OPEN_FACEBOOK':
        case 'OPEN_INSTAGRAM':
        case 'OPEN_LINKEDIN':
          return await IntentHandlers.executeUrlAction(actionId, context.rawValue, context, '🌐 Opening link in external application...');
        case 'CALL_PHONE':
          return await IntentHandlers.executeCall(context);
        case 'SEND_SMS':
          return await IntentHandlers.executeSms(context);
        case 'COMPOSE_EMAIL':
          return await IntentHandlers.executeEmail(context);
        case 'OPEN_MAPS':
          return await IntentHandlers.executeMaps(context);
        case 'OPEN_GOOGLE_MAPS':
          return await IntentHandlers.executeGoogleMaps(context);
        case 'OPEN_WHATSAPP':
          return await IntentHandlers.executeWhatsApp(context);
        case 'OPEN_UPI_PAYMENT':
          return await IntentHandlers.executeUpiPayment(context);
        case 'OPEN_BARCODE_SEARCH':
          return await IntentHandlers.executeBarcodeSearch(context);
        case 'CONNECT_WIFI':
          return await IntentHandlers.executeConnectWifi(context);
        case 'COPY_WIFI_PASSWORD':
          return await IntentHandlers.executeCopyWifiPassword(context);
        case 'COPY_UPI_ID':
          return await IntentHandlers.executeCopyUpiId(context);
        case 'COPY_COORDINATES':
          return await IntentHandlers.executeCopyCoordinates(context);
        case 'CREATE_CONTACT':
          return await IntentHandlers.executeCreateContact(context);
        case 'CREATE_CALENDAR':
          return await IntentHandlers.executeCreateCalendar(context);
        case 'GENERATE_QR_FROM_RESULT':
          context.onNavigate?.('/(screens)/qr-generator', { initialPayload: context.rawValue, initialType: context.contentType });
          context.onToast?.('🎨 Loaded decoded payload into QR Generator Matrix Studio!', 'success');
          await PlatformHandlers.triggerSuccessHaptic();
          return { success: true, actionId, message: 'Navigated to generator' };
        case 'TOGGLE_FAVORITE': {
          const scanId = context.scanId || context.rawValue;
          const isFav = await this.favoritesRepo.isFavorite(scanId);
          if (isFav) {
            await this.favoritesRepo.removeFavorite(scanId);
            context.onToast?.('⭐️ Removed record from favorites vault', 'info');
          } else {
            await this.favoritesRepo.addFavorite(scanId, context.displayTitle);
            context.onToast?.('🌟 Added record to bookmarks vault!', 'success');
          }
          await PlatformHandlers.triggerSuccessHaptic();
          return { success: true, actionId, message: isFav ? 'Unfavorited' : 'Favorited' };
        }
        case 'DELETE_HISTORY_ITEM': {
          if (context.scanId) {
            await this.historyRepo.deleteRecord(context.scanId);
            await this.favoritesRepo.removeFavorite(context.scanId);
          }
          context.onToast?.('🗑️ Scan record permanently deleted from vault', 'success');
          await PlatformHandlers.triggerSuccessHaptic();
          context.onNavigate?.('back');
          return { success: true, actionId, message: 'Record deleted' };
        }
        case 'CLEAR_HISTORY_ITEM': {
          context.onToast?.('🧹 Discovery buffer cache cleared', 'info');
          await PlatformHandlers.triggerSuccessHaptic();
          context.onNavigate?.('back');
          return { success: true, actionId, message: 'Buffer cleared' };
        }
        case 'RENAME_HISTORY_ITEM': {
          if (context.onRenameRequest) {
            return new Promise((resolve) => {
              context.onRenameRequest!(context.displayTitle, async (newLabel: string) => {
                if (context.scanId) {
                  // If in favorites, update label
                  await this.favoritesRepo.addFavorite(context.scanId!, newLabel);
                }
                context.onToast?.(`✏️ Record renamed to "${newLabel}"`, 'success');
                await PlatformHandlers.triggerSuccessHaptic();
                resolve({ success: true, actionId, message: 'Item renamed' });
              });
            });
          }
          return { success: true, actionId, message: 'Rename triggered' };
        }
        default:
          return { success: false, actionId, message: 'Unhandled action execution', errorCode: 'UNKNOWN_ERROR' };
      }
    } catch (err: any) {
      console.error(`[ActionService] Execution error on ${actionId}:`, err);
      await PlatformHandlers.triggerErrorHaptic();
      context.onToast?.('⚠️ An unexpected error occurred executing this action.', 'error');
      return { success: false, actionId, message: err?.message || 'Execution exception', errorCode: 'UNKNOWN_ERROR' };
    }
  }
}
