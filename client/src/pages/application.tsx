import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Printer, ArrowLeft, ArrowRight, Save, Loader2, Plus, X, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import logoPath from "@assets/GLOBAL-VISA-logo_1771013259487.webp";

type FormData = Record<string, unknown>;

function TermsContent() {
  return (
    <div className="space-y-4 text-sm text-foreground leading-relaxed">
      <h3 className="font-semibold text-base">Terms and Conditions</h3>
      <p>
        By using this service, you agree to the following terms and conditions
        governing the submission of your visa application through Global Visas.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          All information provided in this application must be accurate and
          truthful. Providing false or misleading information may result in the
          refusal of your visa application.
        </li>
        <li>
          You understand that Global Visas acts as an authorized representative
          to assist with visa applications and does not guarantee the outcome
          of any application.
        </li>
        <li>
          Processing times may vary. Global Visas is not responsible for delays
          caused by government authorities or third parties.
        </li>
        <li>
          You consent to the collection, storage, and processing of your
          personal data in accordance with applicable privacy laws and our
          Privacy Policy.
        </li>
        <li>
          All documents submitted become part of your application record and
          may be shared with relevant government authorities as required.
        </li>
        <li>
          You agree to promptly provide any additional information or
          documentation requested during the processing of your application.
        </li>
        <li>
          Application fees are non-refundable once the application has been
          submitted to the relevant authority.
        </li>
      </ul>

      <h3 className="font-semibold text-base mt-6">Privacy Statement</h3>
      <p>
        Global Visas is committed to protecting your privacy. We collect
        personal information necessary for processing your visa application,
        including but not limited to: name, date of birth, passport details,
        employment history, and travel plans.
      </p>
      <p>
        Your information is stored securely and is only shared with relevant
        government authorities as required for your application. We do not sell
        or share your personal data with third parties for marketing purposes.
      </p>
      <p>
        You have the right to access, correct, or request deletion of your
        personal data at any time by contacting our support team.
      </p>
    </div>
  );
}

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina",
  "Brazil", "Brunei", "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "China",
  "Colombia", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Ecuador",
  "Egypt", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Georgia", "Germany",
  "Ghana", "Greece", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran",
  "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kuwait", "Laos", "Latvia", "Lebanon", "Libya", "Lithuania", "Luxembourg",
  "Macau", "Malaysia", "Maldives", "Malta", "Mexico", "Mongolia", "Morocco", "Myanmar",
  "Nepal", "Netherlands", "New Zealand", "Nigeria", "North Korea", "Norway", "Oman",
  "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Serbia", "Singapore",
  "Slovakia", "Slovenia", "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka",
  "Sudan", "Sweden", "Switzerland", "Syria", "Taiwan", "Thailand", "Tonga",
  "Tunisia", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam",
  "Yemen", "Zimbabwe",
];

const LEGAL_STATUSES = [
  "Citizen",
  "Permanent Resident",
  "Visitor",
  "Student",
  "Work Visa",
  "No Legal Status",
  "Other",
];

const VISIT_REASONS = [
  "Business",
  "Tourism",
  "Family Visit",
  "Study",
  "Religious Event",
  "Other",
];

const GROUP_TYPES = [
  "Entertainment",
  "Family",
  "Friends",
  "Incentive Tour",
  "School / Study",
  "Sports Team / Sports Event",
  "Work / Employer",
  "Other",
];

const FURTHER_STAY_LENGTHS = [
  "Up to 3 months",
  "Up to 6 months",
  "Up to 12 months",
];

interface StepProps {
  formData: FormData;
  updateFormData: (updates: FormData) => void;
}

function Step1Terms({ formData, updateFormData }: StepProps) {
  const [showTerms, setShowTerms] = useState(false);
  const agreed = formData.termsAccepted === true;

  return (
    <Card>
      <CardHeader className="pb-3">
        <h2 className="text-lg font-semibold text-primary" data-testid="text-step-title">Terms and Conditions</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowTerms(!showTerms)}
            className="text-primary text-sm font-medium underline"
            data-testid="button-view-terms"
          >
            {showTerms ? "Hide Terms and Conditions" : "View Terms and Conditions"}
          </button>
          <br />
          <button
            type="button"
            onClick={() => setShowTerms(!showTerms)}
            className="text-primary text-sm font-medium underline"
            data-testid="button-view-privacy"
          >
            View Privacy Statement
          </button>
        </div>

        {showTerms && (
          <Card>
            <CardContent className="p-4 max-h-96 overflow-y-auto">
              <TermsContent />
            </CardContent>
          </Card>
        )}

        <div className="flex items-start gap-3 py-4">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => updateFormData({ termsAccepted: checked === true })}
            data-testid="checkbox-terms"
          />
          <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            I have read and agree to the terms and conditions
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

function GroupDetailsDialog({
  open,
  onOpenChange,
  formData,
  updateFormData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  updateFormData: (updates: FormData) => void;
}) {
  const [groupCreated, setGroupCreated] = useState<string>(
    (formData.groupAlreadyCreated as string) || ""
  );
  const [groupId, setGroupId] = useState<string>(
    (formData.groupId as string) || ""
  );
  const [groupName, setGroupName] = useState<string>(
    (formData.groupName as string) || ""
  );
  const [groupType, setGroupType] = useState<string>(
    (formData.groupType as string) || ""
  );

  useEffect(() => {
    if (open) {
      setGroupCreated((formData.groupAlreadyCreated as string) || "");
      setGroupId((formData.groupId as string) || "");
      setGroupName((formData.groupName as string) || "");
      setGroupType((formData.groupType as string) || "");
    }
  }, [open, formData]);

  const handleConfirm = () => {
    const updates: FormData = { groupAlreadyCreated: groupCreated };
    if (groupCreated === "yes") {
      updates.groupId = groupId;
      updates.groupName = undefined;
      updates.groupType = undefined;
    } else if (groupCreated === "no") {
      updates.groupName = groupName;
      updates.groupType = groupType;
      updates.groupId = undefined;
    }
    updateFormData(updates);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary text-lg">Group details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-primary">Group details</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>If you have previously created a group, select Yes and enter the Group ID. Otherwise select No to create a new group.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div>
            <p className="text-sm mb-3">Has the group already been created?</p>
            <RadioGroup
              value={groupCreated}
              onValueChange={(val) => setGroupCreated(val)}
              className="flex items-center gap-6"
              data-testid="radio-group-created"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="group-created-yes" data-testid="radio-group-created-yes" />
                <Label htmlFor="group-created-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="group-created-no" data-testid="radio-group-created-no" />
                <Label htmlFor="group-created-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {groupCreated === "yes" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Group ID</Label>
                <Input
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  placeholder="Enter group ID"
                  data-testid="input-group-id"
                />
              </div>
            </div>
          )}

          {groupCreated === "no" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Enter group name to create a new group</p>
              <div className="space-y-2">
                <Label className="text-sm">Group name</Label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  data-testid="input-group-name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Group type</Label>
                <Select value={groupType} onValueChange={(val) => setGroupType(val)}>
                  <SelectTrigger data-testid="select-group-type">
                    <SelectValue placeholder="Select group type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-group-cancel">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!groupCreated} data-testid="button-group-confirm">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Step2ApplicationContext({ formData, updateFormData }: StepProps) {
  const outsideAustralia = formData.outsideAustralia as string | undefined;
  const visaStream = formData.visaStream as string | undefined;
  const reasons = (formData.visitReasons as string[]) || [];
  const [selectedReason, setSelectedReason] = useState("");
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [streamWarningOpen, setStreamWarningOpen] = useState(false);
  const [pendingReason, setPendingReason] = useState("");

  const addReason = () => {
    if (selectedReason && !reasons.includes(selectedReason)) {
      if (visaStream === "tourist" && selectedReason === "Business") {
        setPendingReason(selectedReason);
        setStreamWarningOpen(true);
        return;
      }
      updateFormData({ visitReasons: [...reasons, selectedReason] });
      setSelectedReason("");
    }
  };

  const confirmWarningReason = () => {
    if (pendingReason && !reasons.includes(pendingReason)) {
      updateFormData({ visitReasons: [...reasons, pendingReason] });
      setSelectedReason("");
    }
    setPendingReason("");
    setStreamWarningOpen(false);
  };

  const cancelWarningReason = () => {
    setPendingReason("");
    setStreamWarningOpen(false);
  };

  const removeReason = (index: number) => {
    const updated = reasons.filter((_, i) => i !== index);
    updateFormData({ visitReasons: updated });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-lg font-semibold text-primary" data-testid="text-step-title">Application context</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3">Current location</h3>
            <p className="text-sm mb-3">Is the applicant currently outside Australia?</p>
            <RadioGroup
              value={outsideAustralia || ""}
              onValueChange={(val) => updateFormData({ outsideAustralia: val })}
              className="flex items-center gap-6"
              data-testid="radio-outside-australia"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="outside-yes" data-testid="radio-outside-yes" />
                <Label htmlFor="outside-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="outside-no" data-testid="radio-outside-no" />
                <Label htmlFor="outside-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {outsideAustralia === "yes" && (
            <div className="space-y-6 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Give the current location of the applicant and their legal status at this location.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Current location</Label>
                  <Select
                    value={(formData.currentLocation as string) || ""}
                    onValueChange={(val) => updateFormData({ currentLocation: val })}
                  >
                    <SelectTrigger data-testid="select-current-location">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Legal status</Label>
                  <Select
                    value={(formData.legalStatus as string) || ""}
                    onValueChange={(val) => updateFormData({ legalStatus: val })}
                  >
                    <SelectTrigger data-testid="select-legal-status">
                      <SelectValue placeholder="Select legal status" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEGAL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-primary">Purpose of stay</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Select the visa stream that best matches your purpose of travel to Australia.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm mb-3">Select the stream the applicant is applying for:</p>
                <RadioGroup
                  value={visaStream || ""}
                  onValueChange={(val) => updateFormData({ visaStream: val })}
                  className="space-y-2"
                  data-testid="radio-visa-stream"
                >
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="business" id="stream-business" className="mt-0.5" data-testid="radio-stream-business" />
                    <Label htmlFor="stream-business" className="text-sm cursor-pointer leading-relaxed">
                      Business Visitor stream (business visit for meetings, conferences or negotiations but not for work)
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="frequent" id="stream-frequent" className="mt-0.5" data-testid="radio-stream-frequent" />
                    <Label htmlFor="stream-frequent" className="text-sm cursor-pointer leading-relaxed">
                      Frequent Traveller stream (tourism or business purposes)
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="sponsored" id="stream-sponsored" className="mt-0.5" data-testid="radio-stream-sponsored" />
                    <Label htmlFor="stream-sponsored" className="text-sm cursor-pointer leading-relaxed">
                      Sponsored Family stream (requires Sponsorship form 1149)
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="tourist" id="stream-tourist" className="mt-0.5" data-testid="radio-stream-tourist" />
                    <Label htmlFor="stream-tourist" className="text-sm cursor-pointer leading-relaxed">
                      Tourist stream (tourism/visit family or friends)
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Once the application has been lodged, the stream cannot be changed. For more information on each stream, click on the help icon above.
                </p>

                {visaStream === "frequent" && (
                  <div className="mt-4 p-3 bg-accent/50 rounded-md space-y-3">
                    <p className="text-sm font-medium">
                      <span className="font-semibold">Note:</span> This stream has a higher application fee and is only available to applicants with a passport from an eligible country.
                    </p>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Select the applicant's initial purpose of stay</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select whether the primary purpose is business or tourism</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <RadioGroup
                      value={(formData.frequentPurpose as string) || ""}
                      onValueChange={(val) => updateFormData({ frequentPurpose: val })}
                      className="flex items-center gap-6"
                      data-testid="radio-frequent-purpose"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="business" id="freq-business" data-testid="radio-freq-business" />
                        <Label htmlFor="freq-business" className="text-sm cursor-pointer">Business</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="tourism" id="freq-tourism" data-testid="radio-freq-tourism" />
                        <Label htmlFor="freq-tourism" className="text-sm cursor-pointer">Tourism</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {visaStream === "sponsored" && (
                  <div className="mt-4 p-3 bg-accent/50 rounded-md">
                    <p className="text-sm">
                      <span className="font-semibold">Note:</span> The Sponsored Family stream has more restrictive conditions than the Tourist stream. In some cases a security bond may be requested. If you are planning to visit family, you can apply for the Tourist stream which does not require a bond and does not require formal sponsorship.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm">List all reasons for visiting Australia</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedReason}
                    onValueChange={(val) => setSelectedReason(val)}
                  >
                    <SelectTrigger className="flex-1" data-testid="select-visit-reason">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIT_REASONS.filter((r) => !reasons.includes(r)).map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" onClick={addReason} disabled={!selectedReason} data-testid="button-add-reason">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select all applicable reasons for your visit</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {reasons.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {reasons.map((reason, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-md">
                        {reason}
                        <button type="button" onClick={() => removeReason(i)} className="ml-1" data-testid={`button-remove-reason-${i}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Give details of any significant dates on which the applicant needs to be in Australia</Label>
                <Textarea
                  value={(formData.significantDates as string) || ""}
                  onChange={(e) => updateFormData({ significantDates: e.target.value })}
                  className="resize-none min-h-[100px]"
                  placeholder="Enter any significant dates and reasons..."
                  data-testid="textarea-significant-dates"
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-primary">Group processing</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Select Yes if this application is part of a group of applications being lodged together.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm mb-3">Is this application being lodged as part of a group of applications?</p>
                <RadioGroup
                  value={(formData.groupProcessing as string) || ""}
                  onValueChange={(val) => updateFormData({ groupProcessing: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-group-processing"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="group-yes" data-testid="radio-group-yes" />
                    <Label htmlFor="group-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="group-no" data-testid="radio-group-no" />
                    <Label htmlFor="group-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>

                {formData.groupProcessing === "yes" && (
                  <div className="mt-4 space-y-3">
                    <Button variant="outline" size="sm" onClick={() => setGroupDialogOpen(true)} data-testid="button-select-group">
                      Select group
                    </Button>

                    {formData.groupAlreadyCreated === "yes" && Boolean(formData.groupId) && (
                      <p className="text-sm text-muted-foreground">
                        Group ID: <span className="font-medium text-foreground">{String(formData.groupId)}</span>
                      </p>
                    )}
                    {formData.groupAlreadyCreated === "no" && Boolean(formData.groupName) && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Group name: <span className="font-medium text-foreground">{String(formData.groupName)}</span></p>
                        {Boolean(formData.groupType) && (
                          <p>Group type: <span className="font-medium text-foreground">{String(formData.groupType)}</span></p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-primary">Special category of entry</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>This applies to foreign government representatives, United Nations travellers, or exempt group members.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm mb-3">
                  Is the applicant travelling as a representative of a foreign government, travelling on a United Nations Laissez-Passer or a member of an exempt group?
                </p>
                <RadioGroup
                  value={(formData.specialCategory as string) || ""}
                  onValueChange={(val) => updateFormData({ specialCategory: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-special-category"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="special-yes" data-testid="radio-special-yes" />
                    <Label htmlFor="special-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="special-no" data-testid="radio-special-no" />
                    <Label htmlFor="special-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>

                {formData.specialCategory === "yes" && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-primary">Select the special category of entry</p>
                    <RadioGroup
                      value={(formData.specialCategoryType as string) || ""}
                      onValueChange={(val) => updateFormData({ specialCategoryType: val })}
                      className="space-y-2"
                      data-testid="radio-special-category-type"
                    >
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="foreign_gov" id="cat-foreign-gov" className="mt-0.5" data-testid="radio-cat-foreign-gov" />
                        <Label htmlFor="cat-foreign-gov" className="text-sm cursor-pointer leading-relaxed">
                          Travelling as a foreign government representative
                        </Label>
                      </div>
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="un_laissez" id="cat-un" className="mt-0.5" data-testid="radio-cat-un" />
                        <Label htmlFor="cat-un" className="text-sm cursor-pointer leading-relaxed">
                          Travelling on a United Nations Laissez-Passer
                        </Label>
                      </div>
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="exempt_group" id="cat-exempt" className="mt-0.5" data-testid="radio-cat-exempt" />
                        <Label htmlFor="cat-exempt" className="text-sm cursor-pointer leading-relaxed">
                          Member of an exempt group
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>
          )}

          {outsideAustralia === "no" && (
            <div className="space-y-6 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Note: Applications for the Visitor visa made within Australia are for the Tourist stream of the visa.
              </p>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-primary">Further stay</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Provide details about your request to extend your stay in Australia.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm mb-4">Give details of the request for further stay.</p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Length of further stay</Label>
                    <Select
                      value={(formData.furtherStayLength as string) || ""}
                      onValueChange={(val) => updateFormData({ furtherStayLength: val })}
                    >
                      <SelectTrigger data-testid="select-further-stay-length">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        {FURTHER_STAY_LENGTHS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Requested end date</Label>
                    <Input
                      type="date"
                      value={(formData.requestedEndDate as string) || ""}
                      onChange={(e) => updateFormData({ requestedEndDate: e.target.value })}
                      data-testid="input-requested-end-date"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Note: If the request for further stay will result in the applicant being authorised to stay in Australia for more than 12 months on certain visitor, working holiday and bridging visas, they must demonstrate that they have exceptional reasons for the further stay. Provide all details.
                  </p>

                  <div className="space-y-2">
                    <Label className="text-sm">Reason for further stay</Label>
                    <Textarea
                      value={(formData.furtherStayReason as string) || ""}
                      onChange={(e) => updateFormData({ furtherStayReason: e.target.value })}
                      className="resize-none min-h-[100px]"
                      placeholder="Provide your reasons for requesting further stay..."
                      data-testid="textarea-further-stay-reason"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-primary">Special category of entry</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>This applies to foreign government representatives, United Nations travellers, or exempt group members.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm mb-3">
                  Is the applicant travelling as a representative of a foreign government, travelling on a United Nations Laissez-Passer or a member of an exempt group?
                </p>
                <RadioGroup
                  value={(formData.specialCategory as string) || ""}
                  onValueChange={(val) => updateFormData({ specialCategory: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-special-category-inside"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="special-yes-in" data-testid="radio-special-yes-inside" />
                    <Label htmlFor="special-yes-in" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="special-no-in" data-testid="radio-special-no-inside" />
                    <Label htmlFor="special-no-in" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>

                {formData.specialCategory === "yes" && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-primary">Select the special category of entry</p>
                    <RadioGroup
                      value={(formData.specialCategoryType as string) || ""}
                      onValueChange={(val) => updateFormData({ specialCategoryType: val })}
                      className="space-y-2"
                      data-testid="radio-special-category-type-inside"
                    >
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="foreign_gov" id="cat-foreign-gov-in" className="mt-0.5" data-testid="radio-cat-foreign-gov-inside" />
                        <Label htmlFor="cat-foreign-gov-in" className="text-sm cursor-pointer leading-relaxed">
                          Travelling as a foreign government representative
                        </Label>
                      </div>
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="un_laissez" id="cat-un-in" className="mt-0.5" data-testid="radio-cat-un-inside" />
                        <Label htmlFor="cat-un-in" className="text-sm cursor-pointer leading-relaxed">
                          Travelling on a United Nations Laissez-Passer
                        </Label>
                      </div>
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="exempt_group" id="cat-exempt-in" className="mt-0.5" data-testid="radio-cat-exempt-inside" />
                        <Label htmlFor="cat-exempt-in" className="text-sm cursor-pointer leading-relaxed">
                          Member of an exempt group
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <GroupDetailsDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        formData={formData}
        updateFormData={updateFormData}
      />

      <Dialog open={streamWarningOpen} onOpenChange={setStreamWarningOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive">Warning!</DialogTitle>
          </DialogHeader>
          <div className="border rounded-md p-4 text-sm leading-relaxed">
            The Tourist stream is intended for applicants whose primary travel purpose is tourism. If the primary purpose of the applicant's travel is to undertake business activities in Australia, the appropriate stream is the Business Visitor stream. Check the Stream and Reasons for visiting fields and correct if necessary. To continue with the selection click Confirm.
          </div>
          <div className="flex items-center justify-between gap-2 pt-2">
            <Button variant="outline" onClick={cancelWarningReason} data-testid="button-stream-warning-cancel">Cancel</Button>
            <Button onClick={confirmWarningReason} data-testid="button-stream-warning-confirm">Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApplicationPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({});
  const [currentStep, setCurrentStep] = useState(1);

  const { data: application, isLoading } = useQuery<Application>({
    queryKey: ["/api/applications", params.id],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  useEffect(() => {
    if (application) {
      const fd = (application.formData || {}) as FormData;
      setFormData(fd);
      setCurrentStep(application.currentStep);
    }
  }, [application]);

  const saveMutation = useMutation({
    mutationFn: async (data: { formData?: FormData; currentStep?: number }) => {
      const res = await apiRequest("PATCH", `/api/applications/${params.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", params.id] });
    },
  });

  const updateFormData = useCallback((updates: FormData) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSave = useCallback(() => {
    saveMutation.mutate({ formData, currentStep });
    toast({ title: "Saved", description: "Your progress has been saved." });
  }, [formData, currentStep, saveMutation, toast]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      saveMutation.mutate(
        { formData, currentStep: newStep },
        {
          onSuccess: () => {
            setCurrentStep(newStep);
          },
        }
      );
    }
  }, [currentStep, formData, saveMutation]);

  const handleNext = useCallback(() => {
    if (currentStep === 1 && !formData.termsAccepted) {
      toast({
        title: "Terms required",
        description: "Please read and agree to the terms and conditions before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 2) {
      if (!formData.outsideAustralia) {
        toast({
          title: "Required field",
          description: "Please indicate whether the applicant is currently outside Australia.",
          variant: "destructive",
        });
        return;
      }
    }

    const newStep = currentStep + 1;
    saveMutation.mutate(
      { formData, currentStep: newStep },
      {
        onSuccess: () => {
          setCurrentStep(newStep);
          toast({ title: `Step ${currentStep} complete`, description: "Moving to the next step." });
        },
      }
    );
  }, [currentStep, formData, saveMutation, toast]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Application not found.</p>
            <Button className="mt-4" onClick={() => setLocation("/dashboard")} data-testid="button-back-dashboard">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSteps = 20;
  const progressPercent = (currentStep / totalSteps) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Terms formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step2ApplicationContext formData={formData} updateFormData={updateFormData} />;
      default:
        return (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Step {currentStep} is coming soon. Share the screenshot for this step to continue building.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary text-primary-foreground px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="Global Visas" className="h-8 brightness-0 invert object-contain" data-testid="img-logo-header" />
            <span className="font-semibold text-sm">Application for a Visitor Short Stay Visa</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 py-6 flex-1">
        {application.id && (
          <p className="text-xs text-muted-foreground mb-2" data-testid="text-trn">
            Transaction Reference Number (TRN): {application.id.substring(0, 10).toUpperCase()}
          </p>
        )}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Progress value={progressPercent} className="flex-1 h-2" data-testid="progress-bar" />
          </div>
          <p className="text-center text-sm text-muted-foreground" data-testid="text-step-counter">{currentStep}/{totalSteps}</p>
        </div>

        {renderStep()}
      </div>

      <div className="border-t bg-card mt-auto">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {currentStep > 1 && (
              <Button variant="outline" size="sm" onClick={handlePrevious} disabled={saveMutation.isPending} data-testid="button-previous">
                <ArrowLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} data-testid="button-print">
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} data-testid="button-go-to-account">
              Go to my account
            </Button>
          </div>
          <Button onClick={handleNext} disabled={saveMutation.isPending} data-testid="button-next">
            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
