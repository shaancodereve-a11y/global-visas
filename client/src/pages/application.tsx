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
import { Printer, ArrowLeft, ArrowRight, Save, Loader2, Plus, X, HelpCircle, AlertCircle } from "lucide-react";
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

const RELATIONSHIP_STATUSES = [
  "De Facto",
  "Divorced",
  "Engaged",
  "Married",
  "Never Married",
  "Separated",
  "Widowed",
];

interface StepProps {
  formData: FormData;
  updateFormData: (updates: FormData) => void;
  validationErrors?: Record<string, string>;
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

const NAME_CHANGE_REASONS = [
  "Deed poll",
  "Marriage",
  "Other",
];

function ValidationError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="mt-1 border border-destructive rounded-md bg-destructive/10 px-3 py-2 flex items-start gap-2" data-testid="validation-error">
      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
      <p className="text-sm text-destructive">{error}</p>
    </div>
  );
}

function Step3Applicant({ formData, updateFormData, validationErrors = {} }: StepProps) {
  const [otherNameDialogOpen, setOtherNameDialogOpen] = useState(false);
  const [otherNameFamily, setOtherNameFamily] = useState("");
  const [otherNameGiven, setOtherNameGiven] = useState("");
  const [otherNameReason, setOtherNameReason] = useState("");
  const [editingOtherNameIndex, setEditingOtherNameIndex] = useState<number | null>(null);
  const otherNames = (formData.otherNames as Array<{ familyName: string; givenNames: string; reason: string }>) || [];
  const [citizenshipCountrySelect, setCitizenshipCountrySelect] = useState("");
  const otherCitizenships = (formData.otherCitizenships as string[]) || [];

  const [idCardDialogOpen, setIdCardDialogOpen] = useState(false);
  const [idCardFamily, setIdCardFamily] = useState("");
  const [idCardGiven, setIdCardGiven] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [idCardCountry, setIdCardCountry] = useState("");
  const [idCardIssueDate, setIdCardIssueDate] = useState("");
  const [idCardExpiryDate, setIdCardExpiryDate] = useState("");
  const [editingIdCardIndex, setEditingIdCardIndex] = useState<number | null>(null);
  const nationalIdCards = (formData.nationalIdCards as Array<{ familyName: string; givenNames: string; idNumber: string; country: string; issueDate: string; expiryDate: string }>) || [];

  const addNationalIdCard = () => {
    if (editingIdCardIndex !== null) {
      const updated = [...nationalIdCards];
      updated[editingIdCardIndex] = {
        familyName: idCardFamily,
        givenNames: idCardGiven,
        idNumber: idCardNumber,
        country: idCardCountry,
        issueDate: idCardIssueDate,
        expiryDate: idCardExpiryDate,
      };
      updateFormData({ nationalIdCards: updated });
      setEditingIdCardIndex(null);
    } else {
      const updated = [...nationalIdCards, {
        familyName: idCardFamily,
        givenNames: idCardGiven,
        idNumber: idCardNumber,
        country: idCardCountry,
        issueDate: idCardIssueDate,
        expiryDate: idCardExpiryDate,
      }];
      updateFormData({ nationalIdCards: updated });
    }
    setIdCardFamily("");
    setIdCardGiven("");
    setIdCardNumber("");
    setIdCardCountry("");
    setIdCardIssueDate("");
    setIdCardExpiryDate("");
    setIdCardDialogOpen(false);
  };

  const editNationalIdCard = (index: number) => {
    const card = nationalIdCards[index];
    setIdCardFamily(card.familyName);
    setIdCardGiven(card.givenNames);
    setIdCardNumber(card.idNumber);
    setIdCardCountry(card.country);
    setIdCardIssueDate(card.issueDate);
    setIdCardExpiryDate(card.expiryDate);
    setEditingIdCardIndex(index);
    setIdCardDialogOpen(true);
  };

  const removeNationalIdCard = (index: number) => {
    const updated = nationalIdCards.filter((_, i) => i !== index);
    updateFormData({ nationalIdCards: updated });
  };

  const TRAVEL_DOC_TYPES = [
    "DFTTA",
    "Immicard",
    "Passport",
    "PL056(M56)",
    "Titre de voyage",
    "Other travel document",
  ];

  const [travelDocDialogOpen, setTravelDocDialogOpen] = useState(false);
  const [travelDocType, setTravelDocType] = useState("");
  const [travelDocNationality, setTravelDocNationality] = useState("");
  const [travelDocDob, setTravelDocDob] = useState("");
  const [travelDocNumber, setTravelDocNumber] = useState("");
  const [travelDocSex, setTravelDocSex] = useState("");
  const [travelDocExpiry, setTravelDocExpiry] = useState("");
  const [travelDocPlaceOfIssue, setTravelDocPlaceOfIssue] = useState("");
  const [travelDocCountry, setTravelDocCountry] = useState("");
  const [travelDocIssueDate, setTravelDocIssueDate] = useState("");
  const [editingTravelDocIndex, setEditingTravelDocIndex] = useState<number | null>(null);
  const otherTravelDocs = (formData.otherTravelDocs as Array<{ docType: string; name: string; docNumber: string; country: string; nationality: string; dob: string; sex?: string; expiry?: string; placeOfIssue?: string; issueDate?: string }>) || [];

  const autoName = [formData.familyName, formData.givenNames].filter(Boolean).join(", ");

  const addTravelDoc = () => {
    if (travelDocType) {
      const isAustralianDoc = travelDocType === "DFTTA" || travelDocType === "Immicard" || travelDocType === "PL056(M56)";
      const hasAutoName = isAustralianDoc || travelDocType === "Passport" || travelDocType === "Titre de voyage" || travelDocType === "Other travel document";
      const newDoc = {
        docType: travelDocType,
        name: hasAutoName ? autoName : "",
        docNumber: travelDocType === "PL056(M56)" ? "PLO56" : travelDocNumber,
        country: isAustralianDoc ? "AUSTRALIA - AUS" : travelDocCountry,
        nationality: travelDocNationality,
        dob: travelDocDob,
        sex: travelDocSex,
        expiry: travelDocExpiry,
        placeOfIssue: travelDocPlaceOfIssue,
        issueDate: travelDocIssueDate,
      };
      if (editingTravelDocIndex !== null) {
        const updated = [...otherTravelDocs];
        updated[editingTravelDocIndex] = newDoc;
        updateFormData({ otherTravelDocs: updated });
        setEditingTravelDocIndex(null);
      } else {
        updateFormData({ otherTravelDocs: [...otherTravelDocs, newDoc] });
      }
      setTravelDocType("");
      setTravelDocNationality("");
      setTravelDocDob("");
      setTravelDocNumber("");
      setTravelDocSex("");
      setTravelDocExpiry("");
      setTravelDocPlaceOfIssue("");
      setTravelDocCountry("");
      setTravelDocIssueDate("");
      setTravelDocDialogOpen(false);
    }
  };

  const editTravelDoc = (index: number) => {
    const doc = otherTravelDocs[index];
    setTravelDocType(doc.docType);
    setTravelDocNationality(doc.nationality);
    setTravelDocDob(doc.dob);
    setTravelDocNumber(doc.docNumber);
    setTravelDocSex(doc.sex || "");
    setTravelDocExpiry(doc.expiry || "");
    setTravelDocPlaceOfIssue(doc.placeOfIssue || "");
    setTravelDocCountry(doc.country);
    setTravelDocIssueDate(doc.issueDate || "");
    setEditingTravelDocIndex(index);
    setTravelDocDialogOpen(true);
  };

  const removeTravelDoc = (index: number) => {
    const updated = otherTravelDocs.filter((_, i) => i !== index);
    updateFormData({ otherTravelDocs: updated });
  };

  const IDENTITY_DOC_TYPES = [
    "Birth certificate",
    "Driver's licence",
    "National ID card",
    "Social security card",
    "Tax file number",
    "Other",
  ];

  const [identityDocDialogOpen, setIdentityDocDialogOpen] = useState(false);
  const [identityDocFamilyName, setIdentityDocFamilyName] = useState("");
  const [identityDocGivenNames, setIdentityDocGivenNames] = useState("");
  const [identityDocType, setIdentityDocType] = useState("");
  const [identityDocNumber, setIdentityDocNumber] = useState("");
  const [identityDocCountry, setIdentityDocCountry] = useState("");
  const [editingIdentityDocIndex, setEditingIdentityDocIndex] = useState<number | null>(null);
  const otherIdentityDocs = (formData.otherIdentityDocs as Array<{ familyName: string; givenNames: string; docType: string; idNumber: string; country: string }>) || [];

  const addIdentityDoc = () => {
    if (identityDocFamilyName || identityDocGivenNames) {
      const newDoc = {
        familyName: identityDocFamilyName,
        givenNames: identityDocGivenNames,
        docType: identityDocType,
        idNumber: identityDocNumber,
        country: identityDocCountry,
      };
      if (editingIdentityDocIndex !== null) {
        const updated = [...otherIdentityDocs];
        updated[editingIdentityDocIndex] = newDoc;
        updateFormData({ otherIdentityDocs: updated });
        setEditingIdentityDocIndex(null);
      } else {
        updateFormData({ otherIdentityDocs: [...otherIdentityDocs, newDoc] });
      }
      setIdentityDocFamilyName("");
      setIdentityDocGivenNames("");
      setIdentityDocType("");
      setIdentityDocNumber("");
      setIdentityDocCountry("");
      setIdentityDocDialogOpen(false);
    }
  };

  const editIdentityDoc = (index: number) => {
    const doc = otherIdentityDocs[index];
    setIdentityDocFamilyName(doc.familyName);
    setIdentityDocGivenNames(doc.givenNames);
    setIdentityDocType(doc.docType);
    setIdentityDocNumber(doc.idNumber);
    setIdentityDocCountry(doc.country);
    setEditingIdentityDocIndex(index);
    setIdentityDocDialogOpen(true);
  };

  const removeIdentityDoc = (index: number) => {
    const updated = otherIdentityDocs.filter((_, i) => i !== index);
    updateFormData({ otherIdentityDocs: updated });
  };

  const addCitizenship = () => {
    if (citizenshipCountrySelect && !otherCitizenships.includes(citizenshipCountrySelect)) {
      updateFormData({ otherCitizenships: [...otherCitizenships, citizenshipCountrySelect] });
      setCitizenshipCountrySelect("");
    }
  };

  const removeCitizenship = (index: number) => {
    const updated = otherCitizenships.filter((_, i) => i !== index);
    updateFormData({ otherCitizenships: updated });
  };

  const addOtherName = () => {
    if (otherNameFamily || otherNameGiven) {
      if (editingOtherNameIndex !== null) {
        const updated = [...otherNames];
        updated[editingOtherNameIndex] = { familyName: otherNameFamily, givenNames: otherNameGiven, reason: otherNameReason };
        updateFormData({ otherNames: updated });
        setEditingOtherNameIndex(null);
      } else {
        const updated = [...otherNames, { familyName: otherNameFamily, givenNames: otherNameGiven, reason: otherNameReason }];
        updateFormData({ otherNames: updated });
      }
      setOtherNameFamily("");
      setOtherNameGiven("");
      setOtherNameReason("");
      setOtherNameDialogOpen(false);
    }
  };

  const editOtherName = (index: number) => {
    const name = otherNames[index];
    setOtherNameFamily(name.familyName);
    setOtherNameGiven(name.givenNames);
    setOtherNameReason(name.reason);
    setEditingOtherNameIndex(index);
    setOtherNameDialogOpen(true);
  };

  const removeOtherName = (index: number) => {
    const updated = otherNames.filter((_, i) => i !== index);
    updateFormData({ otherNames: updated });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400 shrink-0">Information:</span>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Entering names incorrectly may result in denial of permission to board an aircraft to Australia, or result in delays in border processing on arrival to Australia, even if the applicant has been granted a visa.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-lg font-semibold text-primary" data-testid="text-step-title">Applicant</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-primary">Passport details</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Enter the applicant's passport details exactly as they appear in their passport.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Enter the following details as they appear in the applicant's personal passport.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Family name</Label>
                <div className="col-span-2">
                  <Input
                    value={(formData.familyName as string) || ""}
                    onChange={(e) => updateFormData({ familyName: e.target.value })}
                    data-testid="input-family-name"
                  />
                  <ValidationError error={validationErrors.familyName} />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Given names</Label>
                <div className="col-span-2">
                  <Input
                    value={(formData.givenNames as string) || ""}
                    onChange={(e) => updateFormData({ givenNames: e.target.value })}
                    data-testid="input-given-names"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Sex</Label>
                <div className="col-span-2">
                  <RadioGroup
                    value={(formData.sex as string) || ""}
                    onValueChange={(val) => updateFormData({ sex: val })}
                    className="flex items-center gap-6"
                    data-testid="radio-sex"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="female" id="sex-female" data-testid="radio-sex-female" />
                      <Label htmlFor="sex-female" className="text-sm cursor-pointer">Female</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="male" id="sex-male" data-testid="radio-sex-male" />
                      <Label htmlFor="sex-male" className="text-sm cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="other" id="sex-other" data-testid="radio-sex-other" />
                      <Label htmlFor="sex-other" className="text-sm cursor-pointer">Other</Label>
                    </div>
                  </RadioGroup>
                  <ValidationError error={validationErrors.sex} />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Date of birth</Label>
                <div className="col-span-2">
                  <Input
                    type="date"
                    value={(formData.dateOfBirth as string) || ""}
                    onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                    data-testid="input-date-of-birth"
                  />
                  <ValidationError error={validationErrors.dateOfBirth} />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Passport number</Label>
                <div className="col-span-2">
                  <Input
                    value={(formData.passportNumber as string) || ""}
                    onChange={(e) => updateFormData({ passportNumber: e.target.value })}
                    data-testid="input-passport-number"
                  />
                  <ValidationError error={validationErrors.passportNumber} />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Country of passport</Label>
                <div className="col-span-2">
                  <Select
                    value={(formData.countryOfPassport as string) || ""}
                    onValueChange={(val) => updateFormData({ countryOfPassport: val })}
                  >
                    <SelectTrigger data-testid="select-country-of-passport">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ValidationError error={validationErrors.countryOfPassport} />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Nationality of passport holder</Label>
                <div className="col-span-2">
                  <Select
                    value={(formData.nationalityOfHolder as string) || ""}
                    onValueChange={(val) => updateFormData({ nationalityOfHolder: val })}
                  >
                    <SelectTrigger data-testid="select-nationality-of-holder">
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ValidationError error={validationErrors.nationalityOfHolder} />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Date of issue</Label>
                <div className="col-span-2">
                  <Input
                    type="date"
                    value={(formData.dateOfIssue as string) || ""}
                    onChange={(e) => updateFormData({ dateOfIssue: e.target.value })}
                    data-testid="input-date-of-issue"
                  />
                  <ValidationError error={validationErrors.dateOfIssue} />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Date of expiry</Label>
                <div className="col-span-2">
                  <Input
                    type="date"
                    value={(formData.dateOfExpiry as string) || ""}
                    onChange={(e) => updateFormData({ dateOfExpiry: e.target.value })}
                    data-testid="input-date-of-expiry"
                  />
                  <ValidationError error={validationErrors.dateOfExpiry} />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Place of issue / issuing authority</Label>
                <div className="col-span-2">
                  <Input
                    value={(formData.placeOfIssue as string) || ""}
                    onChange={(e) => updateFormData({ placeOfIssue: e.target.value })}
                    data-testid="input-place-of-issue"
                  />
                  <ValidationError error={validationErrors.placeOfIssue} />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3">It is strongly recommended that the passport be valid for at least six months.</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">National identity card</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm">Does this applicant have a national identity card?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>A national identity card is a government-issued document used to verify a person's identity.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              value={(formData.hasNationalIdCard as string) || ""}
              onValueChange={(val) => updateFormData({ hasNationalIdCard: val })}
              className="flex items-center gap-6"
              data-testid="radio-national-id-card"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="national-id-yes" data-testid="radio-national-id-yes" />
                <Label htmlFor="national-id-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="national-id-no" data-testid="radio-national-id-no" />
                <Label htmlFor="national-id-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            <ValidationError error={validationErrors.hasNationalIdCard} />

            {formData.hasNationalIdCard === "yes" && (
              <>
              <div className="mt-4 border rounded-md">
                <div className="px-3 py-2 border-b">
                  <span className="text-sm font-semibold text-primary">Add details</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-3 py-2 font-semibold">Family name</th>
                        <th className="text-left px-3 py-2 font-semibold">Given names</th>
                        <th className="text-left px-3 py-2 font-semibold">ID number</th>
                        <th className="text-left px-3 py-2 font-semibold">Country</th>
                        <th className="text-left px-3 py-2 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nationalIdCards.map((card, i) => (
                        <tr key={i} className="border-b last:border-b-0" data-testid={`row-id-card-${i}`}>
                          <td className="px-3 py-2">{card.familyName}</td>
                          <td className="px-3 py-2">{card.givenNames}</td>
                          <td className="px-3 py-2">{card.idNumber}</td>
                          <td className="px-3 py-2">{card.country}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <button type="button" className="text-sm text-primary hover:underline" onClick={() => editNationalIdCard(i)} data-testid={`button-edit-id-card-${i}`}>Edit</button>
                              <button type="button" className="text-sm text-primary hover:underline" onClick={() => removeNationalIdCard(i)} data-testid={`button-delete-id-card-${i}`}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-3 py-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => {
                    setIdCardFamily("");
                    setIdCardGiven("");
                    setIdCardNumber("");
                    setIdCardCountry("");
                    setIdCardIssueDate("");
                    setIdCardExpiryDate("");
                    setEditingIdCardIndex(null);
                    setIdCardDialogOpen(true);
                  }} data-testid="button-add-id-card">
                    Add
                  </Button>
                </div>
              </div>
              <ValidationError error={validationErrors.nationalIdCards} />
              </>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-2">Pacific-Australia Card</h3>
            <p className="text-sm text-muted-foreground mb-3">
              The Pacific-Australia Card is issued through an invitation process to Pacific leaders. If the applicant does not hold a Pacific-Australia Card, select 'No' for this question.
            </p>
            <p className="text-sm mb-3">Is the applicant a Pacific-Australia Card holder?</p>
            <RadioGroup
              value={(formData.isPacificAustraliaCardHolder as string) || ""}
              onValueChange={(val) => updateFormData({ isPacificAustraliaCardHolder: val })}
              className="flex items-center gap-6"
              data-testid="radio-pacific-australia-card"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="pacific-card-yes" data-testid="radio-pacific-card-yes" />
                <Label htmlFor="pacific-card-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="pacific-card-no" data-testid="radio-pacific-card-no" />
                <Label htmlFor="pacific-card-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            <ValidationError error={validationErrors.isPacificAustraliaCardHolder} />

            {formData.isPacificAustraliaCardHolder === "yes" && (
              <div className="mt-4">
                <Label className="text-sm font-medium mb-1 block">Pacific-Australia Card serial number (printed on the front of your card)</Label>
                <Input
                  value={(formData.pacificAustraliaCardSerial as string) || ""}
                  onChange={(e) => updateFormData({ pacificAustraliaCardSerial: e.target.value })}
                  data-testid="input-pacific-card-serial"
                />
                <ValidationError error={validationErrors.pacificAustraliaCardSerial} />
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold text-primary">Place of birth</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Enter the applicant's place of birth as shown on their birth certificate or passport.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Town / City</Label>
                <div className="col-span-2">
                  <Input
                    value={(formData.birthTownCity as string) || ""}
                    onChange={(e) => updateFormData({ birthTownCity: e.target.value })}
                    data-testid="input-birth-town-city"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">State / Province</Label>
                <div className="col-span-2">
                  <Input
                    value={(formData.birthStateProvince as string) || ""}
                    onChange={(e) => updateFormData({ birthStateProvince: e.target.value })}
                    data-testid="input-birth-state-province"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Country of birth</Label>
                <div className="col-span-2">
                  <Select
                    value={(formData.birthCountry as string) || ""}
                    onValueChange={(val) => updateFormData({ birthCountry: val })}
                  >
                    <SelectTrigger data-testid="select-birth-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ValidationError error={validationErrors.birthCountry} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Relationship status</h3>
            <div className="grid grid-cols-3 items-center gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Relationship status</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Select the applicant's current relationship status.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="col-span-2">
                <Select
                  value={(formData.relationshipStatus as string) || ""}
                  onValueChange={(val) => updateFormData({ relationshipStatus: val })}
                >
                  <SelectTrigger data-testid="select-relationship-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ValidationError error={validationErrors.relationshipStatus} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Other names / spellings</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm">Is this applicant currently, or have they ever been known by any other names?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Include maiden names, aliases, or any other names the applicant has been known by.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              value={(formData.hasOtherNames as string) || ""}
              onValueChange={(val) => updateFormData({ hasOtherNames: val })}
              className="flex items-center gap-6"
              data-testid="radio-other-names"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="other-names-yes" data-testid="radio-other-names-yes" />
                <Label htmlFor="other-names-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="other-names-no" data-testid="radio-other-names-no" />
                <Label htmlFor="other-names-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            <ValidationError error={validationErrors.hasOtherNames} />

            {formData.hasOtherNames === "yes" && (
              <div className="mt-4 border rounded-md">
                <div className="px-3 py-2 border-b">
                  <span className="text-sm font-semibold text-primary">Add details</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-3 py-2 font-semibold">Family name</th>
                        <th className="text-left px-3 py-2 font-semibold">Given names</th>
                        <th className="text-left px-3 py-2 font-semibold">Reason</th>
                        <th className="text-left px-3 py-2 font-semibold">
                          <span className="flex items-center gap-1">
                            Actions
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Add or remove other names</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {otherNames.map((name, i) => (
                        <tr key={i} className="border-b last:border-b-0" data-testid={`row-other-name-${i}`}>
                          <td className="px-3 py-2">{name.familyName}</td>
                          <td className="px-3 py-2">{name.givenNames}</td>
                          <td className="px-3 py-2">{name.reason}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <button type="button" className="text-sm text-primary hover:underline" onClick={() => editOtherName(i)} data-testid={`button-edit-other-name-${i}`}>Edit</button>
                              <button type="button" className="text-sm text-primary hover:underline" onClick={() => removeOtherName(i)} data-testid={`button-delete-other-name-${i}`}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-3 py-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => {
                    setOtherNameFamily("");
                    setOtherNameGiven("");
                    setOtherNameReason("");
                    setEditingOtherNameIndex(null);
                    setOtherNameDialogOpen(true);
                  }} data-testid="button-add-other-name">
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Citizenship</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm">Is this applicant a citizen of the selected country of passport?</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Indicate whether the applicant holds citizenship in the country that issued their passport.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <RadioGroup
                  value={(formData.citizenOfPassportCountry as string) || ""}
                  onValueChange={(val) => updateFormData({ citizenOfPassportCountry: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-citizen-passport-country"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="citizen-passport-yes" data-testid="radio-citizen-passport-yes" />
                    <Label htmlFor="citizen-passport-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="citizen-passport-no" data-testid="radio-citizen-passport-no" />
                    <Label htmlFor="citizen-passport-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
                <ValidationError error={validationErrors.citizenOfPassportCountry} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm">Is this applicant a citizen of any other country?</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Indicate whether the applicant holds citizenship in any country other than their passport country.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <RadioGroup
                  value={(formData.citizenOfOtherCountry as string) || ""}
                  onValueChange={(val) => updateFormData({ citizenOfOtherCountry: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-citizen-other-country"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="citizen-other-yes" data-testid="radio-citizen-other-yes" />
                    <Label htmlFor="citizen-other-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="citizen-other-no" data-testid="radio-citizen-other-no" />
                    <Label htmlFor="citizen-other-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
                <ValidationError error={validationErrors.citizenOfOtherCountry} />

                {formData.citizenOfOtherCountry === "yes" && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-[100px]">List countries</Label>
                      <Select value={citizenshipCountrySelect} onValueChange={setCitizenshipCountrySelect}>
                        <SelectTrigger className="flex-1" data-testid="select-other-citizenship-country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="icon" variant="outline" onClick={addCitizenship} data-testid="button-add-citizenship">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select and add all countries where the applicant holds citizenship</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {otherCitizenships.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {otherCitizenships.map((country, i) => (
                          <span key={i} className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm" data-testid={`tag-citizenship-${i}`}>
                            {country}
                            <button onClick={() => removeCitizenship(i)} className="text-muted-foreground hover-elevate rounded-sm" data-testid={`button-remove-citizenship-${i}`}>
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Previous travel to Australia</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-3">Has this applicant previously travelled to Australia?</p>
                <RadioGroup
                  value={(formData.previouslyTravelledToAustralia as string) || ""}
                  onValueChange={(val) => updateFormData({ previouslyTravelledToAustralia: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-previously-travelled"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="prev-travel-yes" data-testid="radio-prev-travel-yes" />
                    <Label htmlFor="prev-travel-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="prev-travel-no" data-testid="radio-prev-travel-no" />
                    <Label htmlFor="prev-travel-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
                <ValidationError error={validationErrors.previouslyTravelledToAustralia} />
              </div>
              <div>
                <p className="text-sm mb-3">Has this applicant previously applied for a visa to Australia?</p>
                <RadioGroup
                  value={(formData.previouslyAppliedForVisa as string) || ""}
                  onValueChange={(val) => updateFormData({ previouslyAppliedForVisa: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-previously-applied"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="prev-applied-yes" data-testid="radio-prev-applied-yes" />
                    <Label htmlFor="prev-applied-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="prev-applied-no" data-testid="radio-prev-applied-no" />
                    <Label htmlFor="prev-applied-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
                <ValidationError error={validationErrors.previouslyAppliedForVisa} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Grant number</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm">Does this applicant have an Australian visa grant number?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>A visa grant number is issued when a visa is granted. It can be found on the visa grant notification letter.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              value={(formData.hasGrantNumber as string) || ""}
              onValueChange={(val) => updateFormData({ hasGrantNumber: val })}
              className="flex items-center gap-6"
              data-testid="radio-grant-number"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="grant-number-yes" data-testid="radio-grant-number-yes" />
                <Label htmlFor="grant-number-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="grant-number-no" data-testid="radio-grant-number-no" />
                <Label htmlFor="grant-number-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            <ValidationError error={validationErrors.hasGrantNumber} />

            {formData.hasGrantNumber === "yes" && (
              <div className="mt-4">
                <Label className="text-sm font-medium mb-1 block">Australian visa grant number (if known)</Label>
                <Input
                  value={(formData.visaGrantNumber as string) || ""}
                  onChange={(e) => updateFormData({ visaGrantNumber: e.target.value })}
                  data-testid="input-visa-grant-number"
                />
                <ValidationError error={validationErrors.visaGrantNumber} />
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Other passports or documents for travel</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm">Does this applicant have any other passports or documents for travel?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Include any other valid passports or travel documents held by the applicant.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              value={(formData.hasOtherPassports as string) || ""}
              onValueChange={(val) => updateFormData({ hasOtherPassports: val })}
              className="flex items-center gap-6"
              data-testid="radio-other-passports"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="other-passports-yes" data-testid="radio-other-passports-yes" />
                <Label htmlFor="other-passports-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="other-passports-no" data-testid="radio-other-passports-no" />
                <Label htmlFor="other-passports-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            <ValidationError error={validationErrors.hasOtherPassports} />

            {formData.hasOtherPassports === "yes" && (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm">Does the applicant intend to travel on a United Nations Laissez-Passer?</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>A United Nations Laissez-Passer is a travel document issued by the United Nations.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <RadioGroup
                    value={(formData.travelOnUNLaissezPasser as string) || ""}
                    onValueChange={(val) => updateFormData({ travelOnUNLaissezPasser: val })}
                    className="flex items-center gap-6"
                    data-testid="radio-un-laissez-passer"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="un-laissez-yes" data-testid="radio-un-laissez-yes" />
                      <Label htmlFor="un-laissez-yes" className="text-sm cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="un-laissez-no" data-testid="radio-un-laissez-no" />
                      <Label htmlFor="un-laissez-no" className="text-sm cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <p className="text-sm text-muted-foreground">
                  Give details of any other non United Nations passports or documents for travel that might have been previously used to travel to Australia.
                </p>

                <div className="border rounded-md">
                  <div className="px-3 py-2 border-b">
                    <span className="text-sm font-semibold text-primary">Add details</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left px-3 py-2 font-semibold">Name</th>
                          <th className="text-left px-3 py-2 font-semibold">Passport / document number</th>
                          <th className="text-left px-3 py-2 font-semibold">Country of issue</th>
                          <th className="text-left px-3 py-2 font-semibold">
                            <span className="flex items-center gap-1">
                              Actions
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Add or remove travel documents</p>
                                </TooltipContent>
                              </Tooltip>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {otherTravelDocs.map((doc, i) => (
                          <tr key={i} className="border-b last:border-b-0" data-testid={`row-travel-doc-${i}`}>
                            <td className="px-3 py-2">{doc.name || doc.docType}</td>
                            <td className="px-3 py-2">{doc.docNumber}</td>
                            <td className="px-3 py-2">{doc.country}</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <button type="button" className="text-sm text-primary hover:underline" onClick={() => editTravelDoc(i)} data-testid={`button-edit-travel-doc-${i}`}>Edit</button>
                                <button type="button" className="text-sm text-primary hover:underline" onClick={() => removeTravelDoc(i)} data-testid={`button-delete-travel-doc-${i}`}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-3 py-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => {
                      setTravelDocType("");
                      setTravelDocNationality("");
                      setTravelDocDob("");
                      setTravelDocNumber("");
                      setTravelDocSex("");
                      setTravelDocExpiry("");
                      setTravelDocPlaceOfIssue("");
                      setTravelDocCountry("");
                      setTravelDocIssueDate("");
                      setEditingTravelDocIndex(null);
                      setTravelDocDialogOpen(true);
                    }} data-testid="button-add-travel-doc">
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Other identity documents</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm">Does this applicant have other identity documents?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Include any other government-issued identity documents such as driver's licence or national ID.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              value={(formData.hasOtherIdentityDocs as string) || ""}
              onValueChange={(val) => updateFormData({ hasOtherIdentityDocs: val })}
              className="flex items-center gap-6"
              data-testid="radio-other-identity-docs"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="other-identity-yes" data-testid="radio-other-identity-yes" />
                <Label htmlFor="other-identity-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="other-identity-no" data-testid="radio-other-identity-no" />
                <Label htmlFor="other-identity-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            <ValidationError error={validationErrors.hasOtherIdentityDocs} />

            {formData.hasOtherIdentityDocs === "yes" && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Add details</p>
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2 font-medium">Family name</th>
                          <th className="text-left p-2 font-medium">Given names</th>
                          <th className="text-left p-2 font-medium">Type of document</th>
                          <th className="text-left p-2 font-medium">Identification number</th>
                          <th className="text-left p-2 font-medium">Country of issue</th>
                          <th className="text-left p-2 font-medium flex items-center gap-1">
                            Actions
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remove identity documents from the list</p>
                              </TooltipContent>
                            </Tooltip>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {otherIdentityDocs.map((doc, index) => (
                          <tr key={index} className="border-t" data-testid={`row-identity-doc-${index}`}>
                            <td className="p-2">{doc.familyName}</td>
                            <td className="p-2">{doc.givenNames}</td>
                            <td className="p-2">{doc.docType}</td>
                            <td className="p-2">{doc.idNumber}</td>
                            <td className="p-2">{doc.country}</td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <button type="button" className="text-sm text-primary hover:underline" onClick={() => editIdentityDoc(index)} data-testid={`button-edit-identity-doc-${index}`}>Edit</button>
                                <button type="button" className="text-sm text-primary hover:underline" onClick={() => removeIdentityDoc(index)} data-testid={`button-delete-identity-doc-${index}`}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-3 py-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => {
                      setIdentityDocFamilyName("");
                      setIdentityDocGivenNames("");
                      setIdentityDocType("");
                      setIdentityDocNumber("");
                      setIdentityDocCountry("");
                      setEditingIdentityDocIndex(null);
                      setIdentityDocDialogOpen(true);
                    }} data-testid="button-add-identity-doc">
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Dialog open={identityDocDialogOpen} onOpenChange={setIdentityDocDialogOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-primary">Other identity documents</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter details exactly as shown on the identity document.</p>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Family name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={identityDocFamilyName}
                      onChange={(e) => setIdentityDocFamilyName(e.target.value)}
                      data-testid="input-identity-doc-family-name"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter the family name exactly as shown on the identity document</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Given names</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={identityDocGivenNames}
                      onChange={(e) => setIdentityDocGivenNames(e.target.value)}
                      data-testid="input-identity-doc-given-names"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter the given names exactly as shown on the identity document</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Type of document</Label>
                  <Select value={identityDocType} onValueChange={setIdentityDocType}>
                    <SelectTrigger data-testid="select-identity-doc-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {IDENTITY_DOC_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Identification number</Label>
                  <Input
                    value={identityDocNumber}
                    onChange={(e) => setIdentityDocNumber(e.target.value)}
                    data-testid="input-identity-doc-number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Country of issue</Label>
                  <Select value={identityDocCountry} onValueChange={setIdentityDocCountry}>
                    <SelectTrigger data-testid="select-identity-doc-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex justify-between gap-2 sm:justify-between">
                <Button variant="outline" onClick={() => setIdentityDocDialogOpen(false)} data-testid="button-cancel-identity-doc">
                  Cancel
                </Button>
                <Button onClick={addIdentityDoc} data-testid="button-confirm-identity-doc">
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Health examination</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm">Has this applicant undertaken a health examination for an Australian visa in the last 12 months?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>If the applicant has completed a health examination for a previous Australian visa application within the last 12 months, select Yes.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              value={(formData.hasHealthExamination as string) || ""}
              onValueChange={(val) => updateFormData({ hasHealthExamination: val })}
              className="flex items-center gap-6"
              data-testid="radio-health-examination"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="health-exam-yes" data-testid="radio-health-exam-yes" />
                <Label htmlFor="health-exam-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="health-exam-no" data-testid="radio-health-exam-no" />
                <Label htmlFor="health-exam-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            <ValidationError error={validationErrors.hasHealthExamination} />

            {formData.hasHealthExamination === "yes" && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-1 block">Give details</Label>
                  <Textarea
                    value={(formData.healthExaminationDetails as string) || ""}
                    onChange={(e) => updateFormData({ healthExaminationDetails: e.target.value })}
                    className="min-h-[100px]"
                    data-testid="textarea-health-exam-details"
                  />
                  <ValidationError error={validationErrors.healthExaminationDetails} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-sm font-medium">HAP ID (If available)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The HAP ID is a unique identifier assigned when a health examination is arranged through the department's health services.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    value={(formData.healthExaminationHapId as string) || ""}
                    onChange={(e) => updateFormData({ healthExaminationHapId: e.target.value })}
                    className="max-w-md"
                    data-testid="input-health-exam-hap-id"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={otherNameDialogOpen} onOpenChange={setOtherNameDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Other names / spellings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1 block">Family name</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={otherNameFamily}
                  onChange={(e) => setOtherNameFamily(e.target.value)}
                  data-testid="input-other-family-name"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter the family name (surname)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Given names</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={otherNameGiven}
                  onChange={(e) => setOtherNameGiven(e.target.value)}
                  data-testid="input-other-given-names"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter all given names</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Reason for name change</Label>
              <div className="flex items-center gap-2">
                <Select value={otherNameReason} onValueChange={setOtherNameReason}>
                  <SelectTrigger data-testid="select-other-name-reason">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {NAME_CHANGE_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the reason for the name change</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setOtherNameDialogOpen(false)} data-testid="button-cancel-other-name">
              Cancel
            </Button>
            <Button onClick={addOtherName} data-testid="button-confirm-other-name">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={idCardDialogOpen} onOpenChange={setIdCardDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">National identity card</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Enter details exactly as shown on the national identity card.
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground inline ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Details must match the national identity card exactly</p>
              </TooltipContent>
            </Tooltip>
          </p>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1 block">Family name</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={idCardFamily}
                  onChange={(e) => setIdCardFamily(e.target.value)}
                  data-testid="input-id-card-family-name"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter the family name as shown on the identity card</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Given names</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={idCardGiven}
                  onChange={(e) => setIdCardGiven(e.target.value)}
                  data-testid="input-id-card-given-names"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter all given names as shown on the identity card</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Identification number</Label>
              <Input
                value={idCardNumber}
                onChange={(e) => setIdCardNumber(e.target.value)}
                data-testid="input-id-card-number"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Country of issue</Label>
              <Select value={idCardCountry} onValueChange={setIdCardCountry}>
                <SelectTrigger data-testid="select-id-card-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: If the National identity card does not have a Date of issue or a Date of expiry, do not enter a date. Leave the field/s blank.
            </p>
            <div>
              <Label className="text-sm font-medium mb-1 block">Date of issue</Label>
              <Input
                type="date"
                value={idCardIssueDate}
                onChange={(e) => setIdCardIssueDate(e.target.value)}
                data-testid="input-id-card-issue-date"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Date of expiry</Label>
              <Input
                type="date"
                value={idCardExpiryDate}
                onChange={(e) => setIdCardExpiryDate(e.target.value)}
                data-testid="input-id-card-expiry-date"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setIdCardDialogOpen(false)} data-testid="button-cancel-id-card">
              Cancel
            </Button>
            <Button onClick={addNationalIdCard} data-testid="button-confirm-id-card">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={travelDocDialogOpen} onOpenChange={setTravelDocDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Other passport or document for travel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1 block">Type of document</Label>
              <div className="flex items-center gap-2">
                <Select value={travelDocType} onValueChange={setTravelDocType}>
                  <SelectTrigger data-testid="select-travel-doc-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAVEL_DOC_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the type of travel document</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {travelDocType === "DFTTA" && (
              <>
                <p className="text-sm text-muted-foreground">Enter details as shown on the document for travel.</p>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={autoName}
                      readOnly
                      className="bg-muted/50"
                      data-testid="input-travel-doc-name"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Name auto-populated from applicant details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of birth</Label>
                  <Input
                    type="date"
                    value={travelDocDob}
                    onChange={(e) => setTravelDocDob(e.target.value)}
                    data-testid="input-travel-doc-dob"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Document number</Label>
                  <Input
                    value={travelDocNumber}
                    onChange={(e) => setTravelDocNumber(e.target.value)}
                    data-testid="input-travel-doc-number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Country of issue</Label>
                  <p className="text-sm font-medium">AUSTRALIA - AUS</p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Nationality of document holder</Label>
                  <Select value={travelDocNationality} onValueChange={setTravelDocNationality}>
                    <SelectTrigger data-testid="select-travel-doc-nationality">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {travelDocType === "Immicard" && (
              <>
                <p className="text-sm text-muted-foreground">Enter details as shown on the document for travel.</p>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={autoName}
                      readOnly
                      className="bg-muted/50"
                      data-testid="input-immicard-name"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Name auto-populated from applicant details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sex</Label>
                  <div className="flex items-center gap-4">
                    {["Female", "Male", "Other"].map((option) => (
                      <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="travelDocSex"
                          value={option}
                          checked={travelDocSex === option}
                          onChange={(e) => setTravelDocSex(e.target.value)}
                          className="accent-primary"
                          data-testid={`radio-immicard-sex-${option.toLowerCase()}`}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of birth</Label>
                  <Input
                    type="date"
                    value={travelDocDob}
                    onChange={(e) => setTravelDocDob(e.target.value)}
                    data-testid="input-immicard-dob"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Document number</Label>
                  <Input
                    value={travelDocNumber}
                    onChange={(e) => setTravelDocNumber(e.target.value)}
                    data-testid="input-immicard-doc-number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Country of issue</Label>
                  <p className="text-sm font-medium">AUSTRALIA - AUS</p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Nationality of document holder</Label>
                  <Select value={travelDocNationality} onValueChange={setTravelDocNationality}>
                    <SelectTrigger data-testid="select-immicard-nationality">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of expiry</Label>
                  <Input
                    type="date"
                    value={travelDocExpiry}
                    onChange={(e) => setTravelDocExpiry(e.target.value)}
                    data-testid="input-immicard-expiry"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Place of issue / issuing authority</Label>
                  <Input
                    value={travelDocPlaceOfIssue}
                    onChange={(e) => setTravelDocPlaceOfIssue(e.target.value)}
                    data-testid="input-immicard-place-of-issue"
                  />
                </div>
              </>
            )}

            {travelDocType === "Passport" && (
              <>
                <p className="text-sm text-muted-foreground">Enter details as shown on the passport.</p>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={autoName}
                      readOnly
                      className="bg-muted/50"
                      data-testid="input-passport-name"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Name auto-populated from applicant details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sex</Label>
                  <div className="flex items-center gap-4">
                    {["Female", "Male", "Other"].map((option) => (
                      <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="travelDocSex"
                          value={option}
                          checked={travelDocSex === option}
                          onChange={(e) => setTravelDocSex(e.target.value)}
                          className="accent-primary"
                          data-testid={`radio-passport-sex-${option.toLowerCase()}`}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of birth</Label>
                  <Input
                    type="date"
                    value={travelDocDob}
                    onChange={(e) => setTravelDocDob(e.target.value)}
                    data-testid="input-passport-dob"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Passport number</Label>
                  <Input
                    value={travelDocNumber}
                    onChange={(e) => setTravelDocNumber(e.target.value)}
                    data-testid="input-passport-number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Country of issue</Label>
                  <Select value={travelDocCountry} onValueChange={setTravelDocCountry}>
                    <SelectTrigger data-testid="select-passport-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Nationality of passport holder</Label>
                  <Select value={travelDocNationality} onValueChange={setTravelDocNationality}>
                    <SelectTrigger data-testid="select-passport-nationality">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of issue</Label>
                  <Input
                    type="date"
                    value={travelDocIssueDate}
                    onChange={(e) => setTravelDocIssueDate(e.target.value)}
                    data-testid="input-passport-issue-date"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of expiry</Label>
                  <Input
                    type="date"
                    value={travelDocExpiry}
                    onChange={(e) => setTravelDocExpiry(e.target.value)}
                    data-testid="input-passport-expiry"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Place of issue / issuing authority</Label>
                  <Input
                    value={travelDocPlaceOfIssue}
                    onChange={(e) => setTravelDocPlaceOfIssue(e.target.value)}
                    data-testid="input-passport-place-of-issue"
                  />
                </div>
              </>
            )}

            {travelDocType === "PL056(M56)" && (
              <>
                <p className="text-sm text-muted-foreground">Enter details as shown on the document for travel.</p>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={autoName}
                      readOnly
                      className="bg-muted/50"
                      data-testid="input-plo56-name"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Name auto-populated from applicant details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of birth</Label>
                  <Input
                    type="date"
                    value={travelDocDob}
                    onChange={(e) => setTravelDocDob(e.target.value)}
                    data-testid="input-plo56-dob"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Document number</Label>
                  <p className="text-sm font-medium">PLO56</p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Country of issue</Label>
                  <p className="text-sm font-medium">AUSTRALIA - AUS</p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Nationality of document holder</Label>
                  <Select value={travelDocNationality} onValueChange={setTravelDocNationality}>
                    <SelectTrigger data-testid="select-plo56-nationality">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {travelDocType === "Titre de voyage" && (
              <>
                <p className="text-sm text-muted-foreground">Enter details as shown on the document for travel.</p>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={autoName}
                      readOnly
                      className="bg-muted/50"
                      data-testid="input-titre-name"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Name auto-populated from applicant details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sex</Label>
                  <div className="flex items-center gap-4">
                    {["Female", "Male", "Other"].map((option) => (
                      <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="travelDocSex"
                          value={option}
                          checked={travelDocSex === option}
                          onChange={(e) => setTravelDocSex(e.target.value)}
                          className="accent-primary"
                          data-testid={`radio-titre-sex-${option.toLowerCase()}`}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of birth</Label>
                  <Input
                    type="date"
                    value={travelDocDob}
                    onChange={(e) => setTravelDocDob(e.target.value)}
                    data-testid="input-titre-dob"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Document number</Label>
                  <Input
                    value={travelDocNumber}
                    onChange={(e) => setTravelDocNumber(e.target.value)}
                    data-testid="input-titre-doc-number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Country of issue</Label>
                  <Select value={travelDocCountry} onValueChange={setTravelDocCountry}>
                    <SelectTrigger data-testid="select-titre-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Nationality of document holder</Label>
                  <Select value={travelDocNationality} onValueChange={setTravelDocNationality}>
                    <SelectTrigger data-testid="select-titre-nationality">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of issue</Label>
                  <Input
                    type="date"
                    value={travelDocIssueDate}
                    onChange={(e) => setTravelDocIssueDate(e.target.value)}
                    data-testid="input-titre-issue-date"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of expiry</Label>
                  <Input
                    type="date"
                    value={travelDocExpiry}
                    onChange={(e) => setTravelDocExpiry(e.target.value)}
                    data-testid="input-titre-expiry"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Place of issue / issuing authority</Label>
                  <Input
                    value={travelDocPlaceOfIssue}
                    onChange={(e) => setTravelDocPlaceOfIssue(e.target.value)}
                    data-testid="input-titre-place-of-issue"
                  />
                </div>
              </>
            )}

            {travelDocType === "Other travel document" && (
              <>
                <p className="text-sm text-muted-foreground">Enter details as shown on the document for travel.</p>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={autoName}
                      readOnly
                      className="bg-muted/50"
                      data-testid="input-otherdoc-name"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Name auto-populated from applicant details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sex</Label>
                  <div className="flex items-center gap-4">
                    {["Female", "Male", "Other"].map((option) => (
                      <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="travelDocSex"
                          value={option}
                          checked={travelDocSex === option}
                          onChange={(e) => setTravelDocSex(e.target.value)}
                          className="accent-primary"
                          data-testid={`radio-otherdoc-sex-${option.toLowerCase()}`}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of birth</Label>
                  <Input
                    type="date"
                    value={travelDocDob}
                    onChange={(e) => setTravelDocDob(e.target.value)}
                    data-testid="input-otherdoc-dob"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Document number</Label>
                  <Input
                    value={travelDocNumber}
                    onChange={(e) => setTravelDocNumber(e.target.value)}
                    data-testid="input-otherdoc-doc-number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Country of issue</Label>
                  <Select value={travelDocCountry} onValueChange={setTravelDocCountry}>
                    <SelectTrigger data-testid="select-otherdoc-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Nationality of document holder</Label>
                  <Select value={travelDocNationality} onValueChange={setTravelDocNationality}>
                    <SelectTrigger data-testid="select-otherdoc-nationality">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of issue</Label>
                  <Input
                    type="date"
                    value={travelDocIssueDate}
                    onChange={(e) => setTravelDocIssueDate(e.target.value)}
                    data-testid="input-otherdoc-issue-date"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of expiry</Label>
                  <Input
                    type="date"
                    value={travelDocExpiry}
                    onChange={(e) => setTravelDocExpiry(e.target.value)}
                    data-testid="input-otherdoc-expiry"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Place of issue / issuing authority</Label>
                  <Input
                    value={travelDocPlaceOfIssue}
                    onChange={(e) => setTravelDocPlaceOfIssue(e.target.value)}
                    data-testid="input-otherdoc-place-of-issue"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex justify-between gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setTravelDocDialogOpen(false)} data-testid="button-cancel-travel-doc">
              Cancel
            </Button>
            <Button onClick={addTravelDoc} data-testid="button-confirm-travel-doc">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Step4CriticalDataConfirmation({ formData, updateFormData }: StepProps) {
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const familyName = (formData.familyName as string) || "";
  const givenNames = (formData.givenNames as string) || "";
  const sex = (formData.sex as string) || "";
  const dateOfBirth = formatDate(formData.dateOfBirth as string);
  const birthCountry = (formData.birthCountry as string) || "";
  const passportNumber = (formData.passportNumber as string) || "";
  const countryOfPassport = (formData.countryOfPassport as string) || "";

  const displaySex = sex ? sex.charAt(0).toUpperCase() + sex.slice(1) : "";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-primary mb-4" data-testid="text-step4-title">Critical data confirmation</h2>
          <p className="text-sm mb-3">All information provided is important to the processing of this application.</p>
          <p className="text-sm mb-3">If the information included on this page is incorrect, it may lead to denial of permission to board an aircraft to Australia, even if a visa has been granted.</p>
          <p className="text-sm font-bold mb-6">Confirm that the following information is correct and that it is in the correct fields.</p>

          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm">Family name</span>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-sm font-medium" data-testid="text-confirm-family-name">{familyName}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent><p>Family name as it appears on the passport</p></TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm">Given names</span>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-sm font-medium" data-testid="text-confirm-given-names">{givenNames}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent><p>Given names as they appear on the passport</p></TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm">Sex</span>
              <span className="text-sm font-medium col-span-2" data-testid="text-confirm-sex">{displaySex}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm">Date of birth</span>
              <span className="text-sm font-medium col-span-2" data-testid="text-confirm-dob">{dateOfBirth}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm">Country of birth</span>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-sm font-medium" data-testid="text-confirm-birth-country">{birthCountry}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent><p>Country of birth as provided</p></TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm">Passport number</span>
              <span className="text-sm font-medium col-span-2" data-testid="text-confirm-passport">{passportNumber}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm">Country of passport</span>
              <span className="text-sm font-medium col-span-2" data-testid="text-confirm-passport-country">{countryOfPassport}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <p className="text-sm">Is the above information correct?</p>
            <RadioGroup
              value={(formData.criticalDataConfirmed as string) || ""}
              onValueChange={(val) => updateFormData({ criticalDataConfirmed: val })}
              className="flex items-center gap-6"
              data-testid="radio-critical-data-confirm"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="critical-yes" data-testid="radio-critical-yes" />
                <Label htmlFor="critical-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="critical-no" data-testid="radio-critical-no" />
                <Label htmlFor="critical-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>If the information is not correct, select No to go back and make corrections.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {(formData.criticalDataConfirmed as string) === "no" && (
            <div className="flex items-start gap-2 mt-3 border border-destructive rounded-md p-3" data-testid="text-critical-no-message">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm">Press the 'Previous' button to return to the previous page and correct the details.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Step5TravellingCompanions({ formData, updateFormData }: StepProps) {
  const RELATIONSHIP_OPTIONS = [
    "Aunt", "Brother", "Business associate", "Child", "Cousin", "Daughter",
    "Son in law", "Fiance/ fiancee", "Friend", "Grandchild", "Grandparent",
    "Mother/Father in law", "Nephew", "Niece", "Parent", "Sister",
    "Sister/Brother in law", "Spouse / De facto partner", "Step child",
    "Step parent", "Step brother", "Step sister", "Uncle"
  ];

  const [companionFormOpen, setCompanionFormOpen] = useState(false);
  const [compRelationship, setCompRelationship] = useState("");
  const [compFamilyName, setCompFamilyName] = useState("");
  const [compGivenNames, setCompGivenNames] = useState("");
  const [compSex, setCompSex] = useState("");
  const [compDob, setCompDob] = useState("");
  const [editingCompanionIndex, setEditingCompanionIndex] = useState<number | null>(null);

  const companions = (formData.travellingCompanions as Array<{
    relationship: string; familyName: string; givenNames: string; sex: string; dob: string;
  }>) || [];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const resetForm = () => {
    setCompRelationship("");
    setCompFamilyName("");
    setCompGivenNames("");
    setCompSex("");
    setCompDob("");
    setEditingCompanionIndex(null);
    setCompanionFormOpen(false);
  };

  const confirmCompanion = () => {
    const entry = {
      relationship: compRelationship,
      familyName: compFamilyName,
      givenNames: compGivenNames,
      sex: compSex,
      dob: compDob,
    };
    if (editingCompanionIndex !== null) {
      const updated = [...companions];
      updated[editingCompanionIndex] = entry;
      updateFormData({ travellingCompanions: updated });
    } else {
      updateFormData({ travellingCompanions: [...companions, entry] });
    }
    resetForm();
  };

  const editCompanion = (index: number) => {
    const c = companions[index];
    setCompRelationship(c.relationship);
    setCompFamilyName(c.familyName);
    setCompGivenNames(c.givenNames);
    setCompSex(c.sex);
    setCompDob(c.dob);
    setEditingCompanionIndex(index);
    setCompanionFormOpen(true);
  };

  const removeCompanion = (index: number) => {
    const updated = companions.filter((_, i) => i !== index);
    updateFormData({ travellingCompanions: updated });
  };

  const hasTravellingCompanions = formData.hasTravellingCompanions as string;

  if (companionFormOpen) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-primary mb-4" data-testid="text-companion-form-title">Travelling companion</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Relationship to the applicant</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Select value={compRelationship} onValueChange={setCompRelationship}>
                    <SelectTrigger data-testid="select-comp-relationship">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>The relationship of this person to the applicant</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Family name</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Input value={compFamilyName} onChange={(e) => setCompFamilyName(e.target.value)} data-testid="input-comp-family-name" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>Family name as shown in passport or travel document</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Given names</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Input value={compGivenNames} onChange={(e) => setCompGivenNames(e.target.value)} data-testid="input-comp-given-names" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>Given names as shown in passport or travel document</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Sex</Label>
                <div className="col-span-2">
                  <RadioGroup value={compSex} onValueChange={setCompSex} className="flex items-center gap-6" data-testid="radio-comp-sex">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="female" id="comp-sex-female" />
                      <Label htmlFor="comp-sex-female" className="text-sm cursor-pointer">Female</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="male" id="comp-sex-male" />
                      <Label htmlFor="comp-sex-male" className="text-sm cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="other" id="comp-sex-other" />
                      <Label htmlFor="comp-sex-other" className="text-sm cursor-pointer">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Date of birth</Label>
                <div className="col-span-2">
                  <Input type="date" value={compDob} onChange={(e) => setCompDob(e.target.value)} className="w-48" data-testid="input-comp-dob" />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button variant="outline" size="sm" type="button" onClick={resetForm} data-testid="button-comp-cancel">Cancel</Button>
              <Button variant="outline" size="sm" type="button" onClick={confirmCompanion} data-testid="button-comp-confirm">Confirm</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-primary mb-4" data-testid="text-step5-title">Travelling companions</h2>
          <p className="text-sm mb-4">Each person travelling to Australia must submit a separate visitor visa application. This includes children and other family members. Listing a person's name on this page does NOT mean that the person has applied for a visa.</p>

          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm">Are there any other persons travelling with the applicant to Australia?</p>
            <RadioGroup
              value={hasTravellingCompanions || ""}
              onValueChange={(val) => updateFormData({ hasTravellingCompanions: val })}
              className="flex items-center gap-6"
              data-testid="radio-travelling-companions"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="companions-yes" data-testid="radio-companions-yes" />
                <Label htmlFor="companions-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="companions-no" data-testid="radio-companions-no" />
                <Label htmlFor="companions-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent><p>Indicate if there are other people travelling with the applicant</p></TooltipContent>
            </Tooltip>
          </div>

          {hasTravellingCompanions === "yes" && (
            <div className="border rounded-md p-4">
              <button type="button" className="text-sm text-primary underline mb-3 cursor-pointer" onClick={() => { resetForm(); setCompanionFormOpen(true); }} data-testid="link-add-companion">Add details</button>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="text-left p-2 font-medium">Family name</th>
                      <th className="text-left p-2 font-medium">Given names</th>
                      <th className="text-left p-2 font-medium">Date of birth</th>
                      <th className="text-left p-2 font-medium">Relationship</th>
                      <th className="text-left p-2 font-medium">Actions <Tooltip><TooltipTrigger asChild><HelpCircle className="h-3 w-3 inline text-primary-foreground/70" /></TooltipTrigger><TooltipContent><p>Edit or delete companion entries</p></TooltipContent></Tooltip></th>
                    </tr>
                  </thead>
                  <tbody>
                    {companions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-2">
                          <Button variant="outline" size="sm" type="button" onClick={() => { resetForm(); setCompanionFormOpen(true); }} data-testid="button-add-companion">Add</Button>
                        </td>
                      </tr>
                    ) : (
                      <>
                        {companions.map((c, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-2" data-testid={`text-comp-family-${i}`}>{c.familyName}</td>
                            <td className="p-2" data-testid={`text-comp-given-${i}`}>{c.givenNames}</td>
                            <td className="p-2" data-testid={`text-comp-dob-${i}`}>{formatDate(c.dob)}</td>
                            <td className="p-2" data-testid={`text-comp-relationship-${i}`}>{c.relationship}</td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" type="button" onClick={() => editCompanion(i)} data-testid={`button-edit-comp-${i}`}>Edit</Button>
                                <Button variant="outline" size="sm" type="button" onClick={() => removeCompanion(i)} data-testid={`button-delete-comp-${i}`}>Delete</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={5} className="p-2">
                            <Button variant="outline" size="sm" type="button" onClick={() => { resetForm(); setCompanionFormOpen(true); }} data-testid="button-add-more-companion">Add</Button>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <p className="text-sm mt-4">You can link applications for a family or other people travelling together by creating a group. This helps the Department to process the applications at the same time. To add this application to a group, select Prev until you reach the application context page (page 2 of this form) and update the group details section.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Step6ContactDetails({ formData, updateFormData }: StepProps) {
  const { user } = useAuth();
  const emailAlreadySet = !!(formData.emailAddress as string);

  useEffect(() => {
    if (user?.email && !emailAlreadySet) {
      updateFormData({ emailAddress: user.email });
    }
  }, [user?.email, emailAlreadySet]);

  const DEPARTMENT_OFFICES = [
    "Bangladesh, Dhaka",
    "Brazil, Brasilia",
    "Cambodia, Phnom Penh",
    "Canada, Ottawa",
    "Chile, Santiago de Chile",
    "China, Beijing",
    "China, Guangzhou",
    "China, Hong Kong",
    "China, Shanghai",
    "Colombia, Bogota",
    "Egypt, Cairo",
    "Fiji, Suva",
    "Germany, Berlin",
    "India, Bengaluru",
    "India, New Delhi",
    "Indonesia, Jakarta",
    "Iran, Tehran",
    "Israel, Tel Aviv",
    "Jordan, Amman",
    "Kenya, Nairobi",
    "Malaysia, Kuala Lumpur",
    "Myanmar, Yangon",
    "New Zealand, Wellington",
    "Pakistan, Islamabad",
    "Papua New Guinea, Port Moresby",
    "Philippines, Manila",
    "Republic of Turkiye, Ankara",
    "Serbia, Belgrade",
    "Singapore",
    "South Africa, Pretoria",
    "South Korea, Seoul",
    "Sri Lanka, Colombo",
    "Thailand, Bangkok",
    "Timor-Leste, Dili",
    "United Arab Emirates, Dubai",
    "United Kingdom, London",
    "United States, Washington",
    "Vietnam, Hanoi",
    "Vietnam, Ho Chi Minh City",
  ];

  const postalSameAsResidential = (formData.postalSameAsResidential as string) || "";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-primary mb-6" data-testid="text-step6-title">Contact details</h2>

          <h3 className="text-base font-bold text-primary mb-2">Country of residence</h3>
          <div className="grid grid-cols-3 items-center gap-4 mb-6">
            <Label className="text-sm">Usual country of residence</Label>
            <div className="col-span-2 flex items-center gap-2">
              <Select value={(formData.usualCountryOfResidence as string) || ""} onValueChange={(val) => updateFormData({ usualCountryOfResidence: val })}>
                <SelectTrigger data-testid="select-usual-country-residence">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                </TooltipTrigger>
                <TooltipContent><p>The country where the applicant usually lives</p></TooltipContent>
              </Tooltip>
            </div>
          </div>

          <h3 className="text-base font-bold text-primary mb-2">Department office</h3>
          <p className="text-sm mb-3">The applicant may be required to attend an Australian Government Office for an interview. Which is the closest office to the applicant's current location?</p>
          <div className="grid grid-cols-3 items-center gap-4 mb-6">
            <Label className="text-sm">Office</Label>
            <div className="col-span-2">
              <Select value={(formData.departmentOffice as string) || ""} onValueChange={(val) => updateFormData({ departmentOffice: val })}>
                <SelectTrigger data-testid="select-department-office">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENT_OFFICES.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1 mb-2">
            <h3 className="text-base font-bold text-primary">Residential address</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent><p>The applicant's current residential address</p></TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm mb-3">Note that a street address is required. A post office address cannot be accepted as a residential address.</p>
          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">Country</Label>
              <div className="col-span-2">
                <Select value={(formData.residentialCountry as string) || ""} onValueChange={(val) => updateFormData({ residentialCountry: val })}>
                  <SelectTrigger data-testid="select-residential-country">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">Address</Label>
              <div className="col-span-2 flex items-center gap-2">
                <Input value={(formData.residentialAddress1 as string) || ""} onChange={(e) => updateFormData({ residentialAddress1: e.target.value })} data-testid="input-residential-address1" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent><p>Street address line 1</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm"></Label>
              <div className="col-span-2">
                <Input value={(formData.residentialAddress2 as string) || ""} onChange={(e) => updateFormData({ residentialAddress2: e.target.value })} data-testid="input-residential-address2" />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">Suburb / Town</Label>
              <div className="col-span-2">
                <Input value={(formData.residentialSuburb as string) || ""} onChange={(e) => updateFormData({ residentialSuburb: e.target.value })} data-testid="input-residential-suburb" />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">State or Province</Label>
              <div className="col-span-2">
                <Input value={(formData.residentialState as string) || ""} onChange={(e) => updateFormData({ residentialState: e.target.value })} data-testid="input-residential-state" />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">Postal code</Label>
              <div className="col-span-2">
                <Input value={(formData.residentialPostalCode as string) || ""} onChange={(e) => updateFormData({ residentialPostalCode: e.target.value })} className="w-48" data-testid="input-residential-postal-code" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 mb-2">
            <h3 className="text-base font-bold text-primary">Contact telephone numbers</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent><p>Enter numbers only with no spaces</p></TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm mb-3">Enter numbers only with no spaces.</p>
          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">Home phone</Label>
              <div className="col-span-2">
                <Input value={(formData.homePhone as string) || ""} onChange={(e) => updateFormData({ homePhone: e.target.value })} data-testid="input-home-phone" />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">Business phone</Label>
              <div className="col-span-2">
                <Input value={(formData.businessPhone as string) || ""} onChange={(e) => updateFormData({ businessPhone: e.target.value })} data-testid="input-business-phone" />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">Mobile / Cell phone</Label>
              <div className="col-span-2">
                <Input value={(formData.mobilePhone as string) || ""} onChange={(e) => updateFormData({ mobilePhone: e.target.value })} data-testid="input-mobile-phone" />
              </div>
            </div>
          </div>

          <h3 className="text-base font-bold text-primary mb-2">Postal address</h3>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm">Is the postal address the same as the residential address?</p>
            <RadioGroup
              value={postalSameAsResidential}
              onValueChange={(val) => updateFormData({ postalSameAsResidential: val })}
              className="flex items-center gap-6"
              data-testid="radio-postal-same"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="postal-same-yes" data-testid="radio-postal-same-yes" />
                <Label htmlFor="postal-same-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="postal-same-no" data-testid="radio-postal-same-no" />
                <Label htmlFor="postal-same-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent><p>Select No if the postal address is different from the residential address</p></TooltipContent>
            </Tooltip>
          </div>

          {postalSameAsResidential === "no" && (
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Country</Label>
                <div className="col-span-2">
                  <Select value={(formData.postalCountry as string) || ""} onValueChange={(val) => updateFormData({ postalCountry: val })}>
                    <SelectTrigger data-testid="select-postal-country">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Address</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Input value={(formData.postalAddress1 as string) || ""} onChange={(e) => updateFormData({ postalAddress1: e.target.value })} data-testid="input-postal-address1" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>Postal address line 1</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm"></Label>
                <div className="col-span-2">
                  <Input value={(formData.postalAddress2 as string) || ""} onChange={(e) => updateFormData({ postalAddress2: e.target.value })} data-testid="input-postal-address2" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Suburb / Town</Label>
                <div className="col-span-2">
                  <Input value={(formData.postalSuburb as string) || ""} onChange={(e) => updateFormData({ postalSuburb: e.target.value })} data-testid="input-postal-suburb" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">State or Province</Label>
                <div className="col-span-2">
                  <Input value={(formData.postalState as string) || ""} onChange={(e) => updateFormData({ postalState: e.target.value })} data-testid="input-postal-state" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Postal code</Label>
                <div className="col-span-2">
                  <Input value={(formData.postalPostalCode as string) || ""} onChange={(e) => updateFormData({ postalPostalCode: e.target.value })} className="w-48" data-testid="input-postal-postal-code" />
                </div>
              </div>
            </div>
          )}

          <h3 className="text-base font-bold text-primary mb-2">Email address</h3>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-sm">Email address</Label>
            <div className="col-span-2 flex items-center gap-2">
              <Input value={(formData.emailAddress as string) || ""} onChange={(e) => updateFormData({ emailAddress: e.target.value })} data-testid="input-email-address" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                </TooltipTrigger>
                <TooltipContent><p>Email address for correspondence about this application</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Step7AuthorisedRecipient({ formData, updateFormData }: StepProps) {
  const { user } = useAuth();
  const authorisedRecipient = (formData.authorisedRecipient as string) || "";
  const communicationEmail = (formData.emailAddress as string) || user?.email || "";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-1 mb-4">
            <h2 className="text-lg font-bold text-primary" data-testid="text-step7-title">Authorised recipient</h2>
          </div>
          <p className="text-sm mb-3">Does the applicant authorise another person to receive written correspondence on their behalf?</p>
          <p className="text-sm mb-4">This authorises the department to send the authorised person all written correspondence that would otherwise be sent directly to the applicant.</p>

          <div className="flex justify-center mb-4">
            <RadioGroup
              value={authorisedRecipient}
              onValueChange={(val) => updateFormData({ authorisedRecipient: val })}
              className="space-y-2"
              data-testid="radio-authorised-recipient"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="auth-no" data-testid="radio-auth-no" />
                <Label htmlFor="auth-no" className="text-sm cursor-pointer">No</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="registered_migration_agent" id="auth-migration" data-testid="radio-auth-migration" />
                <Label htmlFor="auth-migration" className="text-sm cursor-pointer">Yes, a registered migration agent</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="legal_practitioner" id="auth-legal" data-testid="radio-auth-legal" />
                <Label htmlFor="auth-legal" className="text-sm cursor-pointer">Yes, a legal practitioner</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="another_person" id="auth-another" data-testid="radio-auth-another" />
                <Label htmlFor="auth-another" className="text-sm cursor-pointer">Yes, another person</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center gap-1">
            <p className="text-sm">This person is referred to as the 'authorised recipient'.</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs"><p>An authorised recipient is a person authorised by the applicant to receive written correspondence from the department on their behalf.</p></TooltipContent>
            </Tooltip>
          </div>

          {authorisedRecipient === "registered_migration_agent" && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-sm">Has the applicant appointed this person to provide them immigration assistance?</p>
                <RadioGroup
                  value={(formData.agentAppointedAssistance as string) || ""}
                  onValueChange={(val) => updateFormData({ agentAppointedAssistance: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-agent-appointed"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="agent-appointed-yes" data-testid="radio-agent-appointed-yes" />
                    <Label htmlFor="agent-appointed-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="agent-appointed-no" data-testid="radio-agent-appointed-no" />
                    <Label htmlFor="agent-appointed-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs"><p>Indicate if this migration agent has been appointed to provide immigration assistance</p></TooltipContent>
                </Tooltip>
              </div>

              <h3 className="text-base font-bold text-primary">Registered migration agent contact details</h3>
              <h4 className="text-sm font-bold text-primary">Registered migration agent</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">MARN</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.agentMarn as string) || ""} onChange={(e) => updateFormData({ agentMarn: e.target.value })} className="w-48" data-testid="input-agent-marn" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Migration Agent Registration Number</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Family name</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.agentFamilyName as string) || ""} onChange={(e) => updateFormData({ agentFamilyName: e.target.value })} data-testid="input-agent-family-name" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Family name of the migration agent</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Given names</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.agentGivenNames as string) || ""} onChange={(e) => updateFormData({ agentGivenNames: e.target.value })} data-testid="input-agent-given-names" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Given names of the migration agent</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Organisation</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.agentOrganisation as string) || ""} onChange={(e) => updateFormData({ agentOrganisation: e.target.value })} data-testid="input-agent-organisation" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Organisation the migration agent belongs to</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-primary mt-4">Postal address</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Country</Label>
                  <div className="col-span-2">
                    <Select value={(formData.agentPostalCountry as string) || ""} onValueChange={(val) => updateFormData({ agentPostalCountry: val })}>
                      <SelectTrigger data-testid="select-agent-postal-country">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Address</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.agentPostalAddress1 as string) || ""} onChange={(e) => updateFormData({ agentPostalAddress1: e.target.value })} data-testid="input-agent-postal-address1" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Postal address line 1</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm"></Label>
                  <div className="col-span-2">
                    <Input value={(formData.agentPostalAddress2 as string) || ""} onChange={(e) => updateFormData({ agentPostalAddress2: e.target.value })} data-testid="input-agent-postal-address2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Suburb / Town</Label>
                  <div className="col-span-2">
                    <Input value={(formData.agentPostalSuburb as string) || ""} onChange={(e) => updateFormData({ agentPostalSuburb: e.target.value })} data-testid="input-agent-postal-suburb" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">State or Province</Label>
                  <div className="col-span-2">
                    <Input value={(formData.agentPostalState as string) || ""} onChange={(e) => updateFormData({ agentPostalState: e.target.value })} data-testid="input-agent-postal-state" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Postal code</Label>
                  <div className="col-span-2">
                    <Input value={(formData.agentPostalCode as string) || ""} onChange={(e) => updateFormData({ agentPostalCode: e.target.value })} className="w-48" data-testid="input-agent-postal-code" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-4">
                <h4 className="text-sm font-bold text-primary">Contact telephone numbers</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent><p>Enter numbers only with no spaces</p></TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm mb-2">Enter numbers only with no spaces.</p>
              <div className="space-y-3">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Business phone</Label>
                  <div className="col-span-2">
                    <Input value={(formData.agentBusinessPhone as string) || ""} onChange={(e) => updateFormData({ agentBusinessPhone: e.target.value })} data-testid="input-agent-business-phone" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Mobile / Cell phone</Label>
                  <div className="col-span-2">
                    <Input value={(formData.agentMobilePhone as string) || ""} onChange={(e) => updateFormData({ agentMobilePhone: e.target.value })} data-testid="input-agent-mobile-phone" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {authorisedRecipient === "legal_practitioner" && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-sm">Has the applicant appointed this person to provide them immigration assistance?</p>
                <RadioGroup
                  value={(formData.legalAppointedAssistance as string) || ""}
                  onValueChange={(val) => updateFormData({ legalAppointedAssistance: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-legal-appointed"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="legal-appointed-yes" data-testid="radio-legal-appointed-yes" />
                    <Label htmlFor="legal-appointed-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="legal-appointed-no" data-testid="radio-legal-appointed-no" />
                    <Label htmlFor="legal-appointed-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs"><p>Indicate if this legal practitioner has been appointed to provide immigration assistance</p></TooltipContent>
                </Tooltip>
              </div>

              <h3 className="text-base font-bold text-primary">Legal practitioner contact details</h3>
              <h4 className="text-sm font-bold text-primary">Legal practitioner</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Legal practitioner number (LPN)</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.legalLpn as string) || ""} onChange={(e) => updateFormData({ legalLpn: e.target.value })} className="w-48" data-testid="input-legal-lpn" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Legal Practitioner Number</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Family name</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.legalFamilyName as string) || ""} onChange={(e) => updateFormData({ legalFamilyName: e.target.value })} data-testid="input-legal-family-name" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Family name of the legal practitioner</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Given names</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.legalGivenNames as string) || ""} onChange={(e) => updateFormData({ legalGivenNames: e.target.value })} data-testid="input-legal-given-names" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Given names of the legal practitioner</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Organisation</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.legalOrganisation as string) || ""} onChange={(e) => updateFormData({ legalOrganisation: e.target.value })} data-testid="input-legal-organisation" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Organisation the legal practitioner belongs to</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-primary mt-4">Postal address</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Country</Label>
                  <div className="col-span-2">
                    <Select value={(formData.legalPostalCountry as string) || ""} onValueChange={(val) => updateFormData({ legalPostalCountry: val })}>
                      <SelectTrigger data-testid="select-legal-postal-country">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Address</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.legalPostalAddress1 as string) || ""} onChange={(e) => updateFormData({ legalPostalAddress1: e.target.value })} data-testid="input-legal-postal-address1" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Postal address line 1</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm"></Label>
                  <div className="col-span-2">
                    <Input value={(formData.legalPostalAddress2 as string) || ""} onChange={(e) => updateFormData({ legalPostalAddress2: e.target.value })} data-testid="input-legal-postal-address2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Suburb / Town</Label>
                  <div className="col-span-2">
                    <Input value={(formData.legalPostalSuburb as string) || ""} onChange={(e) => updateFormData({ legalPostalSuburb: e.target.value })} data-testid="input-legal-postal-suburb" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">State or Province</Label>
                  <div className="col-span-2">
                    <Input value={(formData.legalPostalState as string) || ""} onChange={(e) => updateFormData({ legalPostalState: e.target.value })} data-testid="input-legal-postal-state" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Postal code</Label>
                  <div className="col-span-2">
                    <Input value={(formData.legalPostalCode as string) || ""} onChange={(e) => updateFormData({ legalPostalCode: e.target.value })} className="w-48" data-testid="input-legal-postal-code" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-4">
                <h4 className="text-sm font-bold text-primary">Contact telephone numbers</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent><p>Enter numbers only with no spaces</p></TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm mb-2">Enter numbers only with no spaces.</p>
              <div className="space-y-3">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Business phone</Label>
                  <div className="col-span-2">
                    <Input value={(formData.legalBusinessPhone as string) || ""} onChange={(e) => updateFormData({ legalBusinessPhone: e.target.value })} data-testid="input-legal-business-phone" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Mobile / Cell phone</Label>
                  <div className="col-span-2">
                    <Input value={(formData.legalMobilePhone as string) || ""} onChange={(e) => updateFormData({ legalMobilePhone: e.target.value })} data-testid="input-legal-mobile-phone" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {authorisedRecipient === "another_person" && (
            <div className="mt-4 space-y-4">
              <h3 className="text-base font-bold text-primary">Authorised recipient contact details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Family name</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.otherPersonFamilyName as string) || ""} onChange={(e) => updateFormData({ otherPersonFamilyName: e.target.value })} data-testid="input-other-family-name" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Family name of the authorised recipient</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Given names</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.otherPersonGivenNames as string) || ""} onChange={(e) => updateFormData({ otherPersonGivenNames: e.target.value })} data-testid="input-other-given-names" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Given names of the authorised recipient</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-primary mt-4">Postal address</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Country</Label>
                  <div className="col-span-2">
                    <Select value={(formData.otherPersonPostalCountry as string) || ""} onValueChange={(val) => updateFormData({ otherPersonPostalCountry: val })}>
                      <SelectTrigger data-testid="select-other-postal-country">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Address</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input value={(formData.otherPersonPostalAddress1 as string) || ""} onChange={(e) => updateFormData({ otherPersonPostalAddress1: e.target.value })} data-testid="input-other-postal-address1" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent><p>Postal address line 1</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm"></Label>
                  <div className="col-span-2">
                    <Input value={(formData.otherPersonPostalAddress2 as string) || ""} onChange={(e) => updateFormData({ otherPersonPostalAddress2: e.target.value })} data-testid="input-other-postal-address2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Suburb / Town</Label>
                  <div className="col-span-2">
                    <Input value={(formData.otherPersonPostalSuburb as string) || ""} onChange={(e) => updateFormData({ otherPersonPostalSuburb: e.target.value })} data-testid="input-other-postal-suburb" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">State or Province</Label>
                  <div className="col-span-2">
                    <Input value={(formData.otherPersonPostalState as string) || ""} onChange={(e) => updateFormData({ otherPersonPostalState: e.target.value })} data-testid="input-other-postal-state" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Postal code</Label>
                  <div className="col-span-2">
                    <Input value={(formData.otherPersonPostalCode as string) || ""} onChange={(e) => updateFormData({ otherPersonPostalCode: e.target.value })} className="w-48" data-testid="input-other-postal-code" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-4">
                <h4 className="text-sm font-bold text-primary">Contact telephone numbers</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent><p>Enter numbers only with no spaces</p></TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm mb-2">Enter numbers only with no spaces.</p>
              <div className="space-y-3">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Business phone</Label>
                  <div className="col-span-2">
                    <Input value={(formData.otherPersonBusinessPhone as string) || ""} onChange={(e) => updateFormData({ otherPersonBusinessPhone: e.target.value })} data-testid="input-other-business-phone" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Mobile / Cell phone</Label>
                  <div className="col-span-2">
                    <Input value={(formData.otherPersonMobilePhone as string) || ""} onChange={(e) => updateFormData({ otherPersonMobilePhone: e.target.value })} data-testid="input-other-mobile-phone" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-1 mb-4">
            <h3 className="text-base font-bold text-primary">Electronic communication</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs"><p>The Department communicates electronically where possible</p></TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm mb-2">The Department prefers to communicate electronically as this provides a faster method of communication.</p>
          <p className="text-sm mb-4">All correspondence, including notification of the outcome of the application will be sent to:</p>

          <div className="grid grid-cols-3 items-center gap-4 mb-4">
            <Label className="text-sm">Email address</Label>
            <div className="col-span-2 flex items-center gap-2">
              <Input
                value={
                  authorisedRecipient === "registered_migration_agent" ? ((formData.agentEmail as string) || "") :
                  authorisedRecipient === "legal_practitioner" ? ((formData.legalEmail as string) || "") :
                  authorisedRecipient === "another_person" ? ((formData.otherPersonEmail as string) || "") :
                  communicationEmail
                }
                onChange={
                  authorisedRecipient === "registered_migration_agent" ? (e) => updateFormData({ agentEmail: e.target.value }) :
                  authorisedRecipient === "legal_practitioner" ? (e) => updateFormData({ legalEmail: e.target.value }) :
                  authorisedRecipient === "another_person" ? (e) => updateFormData({ otherPersonEmail: e.target.value }) :
                  undefined
                }
                readOnly={authorisedRecipient === "no" || !authorisedRecipient}
                className={authorisedRecipient === "no" || !authorisedRecipient ? "bg-muted" : ""}
                data-testid="input-communication-email"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                </TooltipTrigger>
                <TooltipContent><p>Email address for all correspondence about this application</p></TooltipContent>
              </Tooltip>
            </div>
          </div>

          <p className="text-sm"><span className="font-bold">Note:</span> The holder of this email address may receive a verification email from the Department if the address has not already been verified. If the address holder receives a verification email, they should click on the link to verify their address before this application is submitted.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Step8NonAccompanyingFamily({ formData, updateFormData }: StepProps) {
  const RELATIONSHIP_OPTIONS = [
    "Aunt", "Brother", "Business associate", "Child", "Cousin", "Daughter",
    "Son in law", "Fiance/ fiancee", "Friend", "Grandchild", "Grandparent",
    "Mother/Father in law", "Nephew", "Niece", "Parent", "Sister",
    "Sister/Brother in law", "Spouse / De facto partner", "Step child",
    "Step parent", "Step brother", "Step sister", "Uncle"
  ];

  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [memberRelationship, setMemberRelationship] = useState("");
  const [memberFamilyName, setMemberFamilyName] = useState("");
  const [memberGivenNames, setMemberGivenNames] = useState("");
  const [memberSex, setMemberSex] = useState("");
  const [memberDob, setMemberDob] = useState("");
  const [memberCountryOfBirth, setMemberCountryOfBirth] = useState("");
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);

  const members = (formData.nonAccompanyingMembers as Array<{
    relationship: string; familyName: string; givenNames: string; sex: string; dob: string; countryOfBirth: string;
  }>) || [];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const resetForm = () => {
    setMemberRelationship("");
    setMemberFamilyName("");
    setMemberGivenNames("");
    setMemberSex("");
    setMemberDob("");
    setMemberCountryOfBirth("");
    setEditingMemberIndex(null);
    setMemberFormOpen(false);
  };

  const confirmMember = () => {
    const entry = {
      relationship: memberRelationship,
      familyName: memberFamilyName,
      givenNames: memberGivenNames,
      sex: memberSex,
      dob: memberDob,
      countryOfBirth: memberCountryOfBirth,
    };
    if (editingMemberIndex !== null) {
      const updated = [...members];
      updated[editingMemberIndex] = entry;
      updateFormData({ nonAccompanyingMembers: updated });
    } else {
      updateFormData({ nonAccompanyingMembers: [...members, entry] });
    }
    resetForm();
  };

  const editMember = (index: number) => {
    const m = members[index];
    setMemberRelationship(m.relationship);
    setMemberFamilyName(m.familyName);
    setMemberGivenNames(m.givenNames);
    setMemberSex(m.sex);
    setMemberDob(m.dob);
    setMemberCountryOfBirth(m.countryOfBirth);
    setEditingMemberIndex(index);
    setMemberFormOpen(true);
  };

  const removeMember = (index: number) => {
    const updated = members.filter((_, i) => i !== index);
    updateFormData({ nonAccompanyingMembers: updated });
  };

  const hasNonAccompanyingMembers = formData.hasNonAccompanyingMembers as string;

  if (memberFormOpen) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-primary mb-4" data-testid="text-member-form-title">Non-accompanying member of the family unit</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Relationship to the applicant</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Select value={memberRelationship} onValueChange={setMemberRelationship}>
                    <SelectTrigger data-testid="select-member-relationship">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>The relationship of this family member to the applicant</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Family name</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Input value={memberFamilyName} onChange={(e) => setMemberFamilyName(e.target.value)} data-testid="input-member-family-name" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>Family name as shown in passport or travel document</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Given names</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Input value={memberGivenNames} onChange={(e) => setMemberGivenNames(e.target.value)} data-testid="input-member-given-names" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>Given names as shown in passport or travel document</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Sex</Label>
                <div className="col-span-2">
                  <RadioGroup value={memberSex} onValueChange={setMemberSex} className="flex items-center gap-6" data-testid="radio-member-sex">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="female" id="member-sex-female" />
                      <Label htmlFor="member-sex-female" className="text-sm cursor-pointer">Female</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="male" id="member-sex-male" />
                      <Label htmlFor="member-sex-male" className="text-sm cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="other" id="member-sex-other" />
                      <Label htmlFor="member-sex-other" className="text-sm cursor-pointer">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Date of birth</Label>
                <div className="col-span-2">
                  <Input type="date" value={memberDob} onChange={(e) => setMemberDob(e.target.value)} className="w-48" data-testid="input-member-dob" />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Country of birth</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Select value={memberCountryOfBirth} onValueChange={setMemberCountryOfBirth}>
                    <SelectTrigger data-testid="select-member-country-birth">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>Country where this family member was born</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button variant="outline" size="sm" type="button" onClick={resetForm} data-testid="button-member-cancel">Cancel</Button>
              <Button variant="outline" size="sm" type="button" onClick={confirmMember} data-testid="button-member-confirm">Confirm</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-primary mb-4" data-testid="text-step8-title">Non-accompanying members of the family unit</h2>
          <p className="text-sm mb-4">Does the applicant have any members of their family unit not travelling to Australia who are not Australian citizens or Australian permanent residents?</p>

          <div className="flex justify-center mb-4">
            <RadioGroup
              value={hasNonAccompanyingMembers || ""}
              onValueChange={(val) => updateFormData({ hasNonAccompanyingMembers: val })}
              className="flex items-center gap-6"
              data-testid="radio-non-accompanying"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="non-acc-yes" data-testid="radio-non-acc-yes" />
                <Label htmlFor="non-acc-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="non-acc-no" data-testid="radio-non-acc-no" />
                <Label htmlFor="non-acc-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground ml-2" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs"><p>Indicate if the applicant has family members not travelling who are not Australian citizens or permanent residents</p></TooltipContent>
            </Tooltip>
          </div>

          {hasNonAccompanyingMembers === "yes" && (
            <div className="border rounded-md p-4">
              <button type="button" className="text-sm text-primary underline mb-3 cursor-pointer" onClick={() => { resetForm(); setMemberFormOpen(true); }} data-testid="link-add-member">Add details</button>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="text-left p-2 font-medium">Family name</th>
                      <th className="text-left p-2 font-medium">Given names</th>
                      <th className="text-left p-2 font-medium">Date of birth</th>
                      <th className="text-left p-2 font-medium">Relationship</th>
                      <th className="text-left p-2 font-medium">Actions <Tooltip><TooltipTrigger asChild><HelpCircle className="h-3 w-3 inline text-primary-foreground/70" /></TooltipTrigger><TooltipContent><p>Edit or delete family member entries</p></TooltipContent></Tooltip></th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-2">
                          <Button variant="outline" size="sm" type="button" onClick={() => { resetForm(); setMemberFormOpen(true); }} data-testid="button-add-member">Add</Button>
                        </td>
                      </tr>
                    ) : (
                      <>
                        {members.map((m, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-2" data-testid={`text-member-family-${i}`}>{m.familyName}</td>
                            <td className="p-2" data-testid={`text-member-given-${i}`}>{m.givenNames}</td>
                            <td className="p-2" data-testid={`text-member-dob-${i}`}>{formatDate(m.dob)}</td>
                            <td className="p-2" data-testid={`text-member-relationship-${i}`}>{m.relationship}</td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" type="button" onClick={() => editMember(i)} data-testid={`button-edit-member-${i}`}>Edit</Button>
                                <Button variant="outline" size="sm" type="button" onClick={() => removeMember(i)} data-testid={`button-delete-member-${i}`}>Delete</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={5} className="p-2">
                            <Button variant="outline" size="sm" type="button" onClick={() => { resetForm(); setMemberFormOpen(true); }} data-testid="button-add-more-member">Add</Button>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Step9EntryToAustralia({ formData, updateFormData }: StepProps) {
  const LENGTH_OF_STAY_OPTIONS = [
    "Up to 3 months", "Up to 6 months", "Up to 12 months"
  ];

  const RELATIONSHIP_OPTIONS = [
    "Aunt", "Brother", "Business associate", "Child", "Cousin", "Daughter",
    "Son in law", "Fiance/ fiancee", "Friend", "Grandchild", "Grandparent",
    "Mother/Father in law", "Nephew", "Niece", "Parent", "Sister",
    "Sister/Brother in law", "Spouse / De facto partner", "Step child",
    "Step parent", "Step brother", "Step sister", "Uncle"
  ];

  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [entryReason, setEntryReason] = useState("");
  const [entryDateFrom, setEntryDateFrom] = useState("");
  const [entryDateTo, setEntryDateTo] = useState("");
  const [editingEntryIndex, setEditingEntryIndex] = useState<number | null>(null);

  const [studyFormOpen, setStudyFormOpen] = useState(false);
  const [studyCourseName, setStudyCourseName] = useState("");
  const [studyInstitution, setStudyInstitution] = useState("");
  const [studyDateFrom, setStudyDateFrom] = useState("");
  const [studyDateTo, setStudyDateTo] = useState("");
  const [editingStudyIndex, setEditingStudyIndex] = useState<number | null>(null);

  const AUSTRALIAN_STATES = [
    "Australian Capital Territory", "New South Wales", "Northern Territory",
    "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia"
  ];

  const RESIDENCY_STATUS_OPTIONS = [
    "Australian citizen", "Australian permanent resident",
    "Australian temporary resident (student)", "Australian temporary resident (visitor)",
    "Australian temporary resident (work visa)", "Other", "Unknown"
  ];

  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [contactRelationship, setContactRelationship] = useState("");
  const [contactFamilyName, setContactFamilyName] = useState("");
  const [contactGivenNames, setContactGivenNames] = useState("");
  const [contactSex, setContactSex] = useState("");
  const [contactDob, setContactDob] = useState("");
  const [contactCountry, setContactCountry] = useState("Australia");
  const [contactAddress1, setContactAddress1] = useState("");
  const [contactAddress2, setContactAddress2] = useState("");
  const [contactSuburb, setContactSuburb] = useState("");
  const [contactState, setContactState] = useState("");
  const [contactPostcode, setContactPostcode] = useState("");
  const [contactHomePhone, setContactHomePhone] = useState("");
  const [contactBusinessPhone, setContactBusinessPhone] = useState("");
  const [contactMobilePhone, setContactMobilePhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactResidencyStatus, setContactResidencyStatus] = useState("");
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);

  const entries = (formData.entryDates as Array<{ reason: string; dateFrom: string; dateTo: string }>) || [];
  const studies = (formData.studyCourses as Array<{ courseName: string; institution: string; dateFrom: string; dateTo: string }>) || [];
  const contacts = (formData.australiaContacts as Array<{ relationship: string; familyName: string; givenNames: string; sex: string; dob: string; country: string; address1: string; address2: string; suburb: string; state: string; postcode: string; homePhone: string; businessPhone: string; mobilePhone: string; email: string; residencyStatus: string }>) || [];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const resetEntryForm = () => { setEntryReason(""); setEntryDateFrom(""); setEntryDateTo(""); setEditingEntryIndex(null); setEntryFormOpen(false); };
  const resetStudyForm = () => { setStudyCourseName(""); setStudyInstitution(""); setStudyDateFrom(""); setStudyDateTo(""); setEditingStudyIndex(null); setStudyFormOpen(false); };
  const resetContactForm = () => { setContactRelationship(""); setContactFamilyName(""); setContactGivenNames(""); setContactSex(""); setContactDob(""); setContactCountry("Australia"); setContactAddress1(""); setContactAddress2(""); setContactSuburb(""); setContactState(""); setContactPostcode(""); setContactHomePhone(""); setContactBusinessPhone(""); setContactMobilePhone(""); setContactEmail(""); setContactResidencyStatus(""); setEditingContactIndex(null); setContactFormOpen(false); };

  const confirmEntry = () => {
    const entry = { reason: entryReason, dateFrom: entryDateFrom, dateTo: entryDateTo };
    if (editingEntryIndex !== null) { const updated = [...entries]; updated[editingEntryIndex] = entry; updateFormData({ entryDates: updated }); }
    else { updateFormData({ entryDates: [...entries, entry] }); }
    resetEntryForm();
  };
  const editEntry = (i: number) => { const e = entries[i]; setEntryReason(e.reason); setEntryDateFrom(e.dateFrom); setEntryDateTo(e.dateTo); setEditingEntryIndex(i); setEntryFormOpen(true); };
  const removeEntry = (i: number) => { updateFormData({ entryDates: entries.filter((_, idx) => idx !== i) }); };

  const confirmStudy = () => {
    const entry = { courseName: studyCourseName, institution: studyInstitution, dateFrom: studyDateFrom, dateTo: studyDateTo };
    if (editingStudyIndex !== null) { const updated = [...studies]; updated[editingStudyIndex] = entry; updateFormData({ studyCourses: updated }); }
    else { updateFormData({ studyCourses: [...studies, entry] }); }
    resetStudyForm();
  };
  const editStudy = (i: number) => { const s = studies[i]; setStudyCourseName(s.courseName); setStudyInstitution(s.institution); setStudyDateFrom(s.dateFrom); setStudyDateTo(s.dateTo); setEditingStudyIndex(i); setStudyFormOpen(true); };
  const removeStudy = (i: number) => { updateFormData({ studyCourses: studies.filter((_, idx) => idx !== i) }); };

  const confirmContact = () => {
    const entry = { relationship: contactRelationship, familyName: contactFamilyName, givenNames: contactGivenNames, sex: contactSex, dob: contactDob, country: contactCountry, address1: contactAddress1, address2: contactAddress2, suburb: contactSuburb, state: contactState, postcode: contactPostcode, homePhone: contactHomePhone, businessPhone: contactBusinessPhone, mobilePhone: contactMobilePhone, email: contactEmail, residencyStatus: contactResidencyStatus };
    if (editingContactIndex !== null) { const updated = [...contacts]; updated[editingContactIndex] = entry; updateFormData({ australiaContacts: updated }); }
    else { updateFormData({ australiaContacts: [...contacts, entry] }); }
    resetContactForm();
  };
  const editContact = (i: number) => { const c = contacts[i]; setContactRelationship(c.relationship); setContactFamilyName(c.familyName); setContactGivenNames(c.givenNames); setContactSex(c.sex || ""); setContactDob(c.dob); setContactCountry(c.country || "Australia"); setContactAddress1(c.address1 || ""); setContactAddress2(c.address2 || ""); setContactSuburb(c.suburb || ""); setContactState(c.state || ""); setContactPostcode(c.postcode || ""); setContactHomePhone(c.homePhone || ""); setContactBusinessPhone(c.businessPhone || ""); setContactMobilePhone(c.mobilePhone || ""); setContactEmail(c.email || ""); setContactResidencyStatus(c.residencyStatus || ""); setEditingContactIndex(i); setContactFormOpen(true); };
  const removeContact = (i: number) => { updateFormData({ australiaContacts: contacts.filter((_, idx) => idx !== i) }); };

  if (entryFormOpen) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm mb-4" data-testid="text-entry-form-title">Give details of the additional entry.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Date from</Label>
                <div className="col-span-2">
                  <Input type="date" value={entryDateFrom} onChange={(e) => setEntryDateFrom(e.target.value)} className="w-48" data-testid="input-entry-date-from" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Date to</Label>
                <div className="col-span-2">
                  <Input type="date" value={entryDateTo} onChange={(e) => setEntryDateTo(e.target.value)} className="w-48" data-testid="input-entry-date-to" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-start gap-4">
                <Label className="text-sm pt-2">Give reason</Label>
                <div className="col-span-2">
                  <Textarea value={entryReason} onChange={(e) => setEntryReason(e.target.value)} className="min-h-[100px]" data-testid="input-entry-reason" />
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button variant="outline" size="sm" type="button" onClick={resetEntryForm} data-testid="button-entry-cancel">Cancel</Button>
              <Button variant="outline" size="sm" type="button" onClick={confirmEntry} data-testid="button-entry-confirm">Confirm</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (studyFormOpen) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-primary mb-1" data-testid="text-study-form-title">Student course details</h2>
            <p className="text-sm mb-4">Give details of the course the applicant is undertaking.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Course name</Label>
                <div className="col-span-2">
                  <Input value={studyCourseName} onChange={(e) => setStudyCourseName(e.target.value)} data-testid="input-study-course" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Institution name</Label>
                <div className="col-span-2">
                  <Input value={studyInstitution} onChange={(e) => setStudyInstitution(e.target.value)} data-testid="input-study-institution" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Date from</Label>
                <div className="col-span-2">
                  <Input type="date" value={studyDateFrom} onChange={(e) => setStudyDateFrom(e.target.value)} className="w-48" data-testid="input-study-date-from" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Date to</Label>
                <div className="col-span-2">
                  <Input type="date" value={studyDateTo} onChange={(e) => setStudyDateTo(e.target.value)} className="w-48" data-testid="input-study-date-to" />
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button variant="outline" size="sm" type="button" onClick={resetStudyForm} data-testid="button-study-cancel">Cancel</Button>
              <Button variant="outline" size="sm" type="button" onClick={confirmStudy} data-testid="button-study-confirm">Confirm</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contactFormOpen) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-primary mb-4" data-testid="text-contact-form-title">Contact in Australia</h2>

            <h3 className="text-base font-bold text-primary mb-3">Relationship to applicant</h3>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Relationship to the applicant</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Select value={contactRelationship} onValueChange={setContactRelationship}>
                    <SelectTrigger data-testid="select-contact-relationship">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>The relationship of this person to the applicant</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            <h3 className="text-base font-bold text-primary mb-3">Contact's details</h3>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Family name</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Input value={contactFamilyName} onChange={(e) => setContactFamilyName(e.target.value)} data-testid="input-contact-family-name" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>Family name of the contact</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Given names</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Input value={contactGivenNames} onChange={(e) => setContactGivenNames(e.target.value)} data-testid="input-contact-given-names" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>Given names of the contact</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Sex</Label>
                <div className="col-span-2">
                  <RadioGroup value={contactSex} onValueChange={setContactSex} className="flex items-center gap-4" data-testid="radio-contact-sex">
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="Female" id="contact-sex-female" data-testid="radio-contact-sex-female" />
                      <Label htmlFor="contact-sex-female" className="text-sm cursor-pointer">Female</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="Male" id="contact-sex-male" data-testid="radio-contact-sex-male" />
                      <Label htmlFor="contact-sex-male" className="text-sm cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="Other" id="contact-sex-other" data-testid="radio-contact-sex-other" />
                      <Label htmlFor="contact-sex-other" className="text-sm cursor-pointer">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Date of birth</Label>
                <div className="col-span-2">
                  <Input type="date" value={contactDob} onChange={(e) => setContactDob(e.target.value)} className="w-48" data-testid="input-contact-dob" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-1">
              <h3 className="text-base font-bold text-primary">Residential address</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent><p>The residential address of the contact in Australia</p></TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm mb-3">Note that a street address is required. A post office address cannot be accepted as a residential address.</p>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Country</Label>
                <div className="col-span-2">
                  <Select value={contactCountry} onValueChange={(val) => { setContactCountry(val); setContactState(""); }}>
                    <SelectTrigger data-testid="select-contact-country">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Address</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Input value={contactAddress1} onChange={(e) => setContactAddress1(e.target.value)} data-testid="input-contact-address1" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>Street address of the contact</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm"></Label>
                <div className="col-span-2">
                  <Input value={contactAddress2} onChange={(e) => setContactAddress2(e.target.value)} data-testid="input-contact-address2" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Suburb / Town</Label>
                <div className="col-span-2">
                  <Input value={contactSuburb} onChange={(e) => setContactSuburb(e.target.value)} data-testid="input-contact-suburb" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">State / Territory</Label>
                <div className="col-span-2">
                  {contactCountry === "Australia" ? (
                    <Select value={contactState} onValueChange={setContactState}>
                      <SelectTrigger data-testid="select-contact-state">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {AUSTRALIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={contactState} onChange={(e) => setContactState(e.target.value)} data-testid="input-contact-state" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Postcode</Label>
                <div className="col-span-2">
                  <Input value={contactPostcode} onChange={(e) => setContactPostcode(e.target.value)} className="w-24" data-testid="input-contact-postcode" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-1">
              <h3 className="text-base font-bold text-primary">Contact telephone numbers</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent><p>Contact telephone numbers for this person</p></TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm mb-3">Enter numbers only with no spaces.</p>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Home phone</Label>
                <div className="col-span-2">
                  <Input value={contactHomePhone} onChange={(e) => setContactHomePhone(e.target.value)} data-testid="input-contact-home-phone" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Business phone</Label>
                <div className="col-span-2">
                  <Input value={contactBusinessPhone} onChange={(e) => setContactBusinessPhone(e.target.value)} data-testid="input-contact-business-phone" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Mobile / Cell phone</Label>
                <div className="col-span-2">
                  <Input value={contactMobilePhone} onChange={(e) => setContactMobilePhone(e.target.value)} data-testid="input-contact-mobile-phone" />
                </div>
              </div>
            </div>

            <h3 className="text-base font-bold text-primary mb-3">Electronic communication</h3>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Email address</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} data-testid="input-contact-email" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>Email address of the contact</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-1">
              <h3 className="text-base font-bold text-primary">Australian residency status</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent><p>The Australian residency status of the contact</p></TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Australian residency status</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Select value={contactResidencyStatus} onValueChange={setContactResidencyStatus}>
                    <SelectTrigger data-testid="select-contact-residency-status">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESIDENCY_STATUS_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent><p>Select the Australian residency status of the contact</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" size="sm" type="button" onClick={resetContactForm} data-testid="button-contact-cancel">Cancel</Button>
              <Button variant="outline" size="sm" type="button" onClick={confirmContact} data-testid="button-contact-confirm">Confirm</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const multipleEntry = formData.multipleEntry as string;
  const knowsEntryDates = formData.knowsEntryDates as string;
  const willStudy = formData.willStudy as string;
  const hasAustraliaContacts = formData.hasAustraliaContacts as string;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-primary mb-2" data-testid="text-step9-title">Entry to Australia</h2>

          <div className="flex items-center gap-1 mb-4">
            <h3 className="text-base font-bold text-primary">Proposed period of stay</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs"><p>Details about the proposed period of stay in Australia</p></TooltipContent>
            </Tooltip>
          </div>

          <p className="text-sm mb-2">Does the applicant intend to enter Australia on more than one occasion?</p>
          <div className="flex justify-center mb-4">
            <RadioGroup
              value={multipleEntry || ""}
              onValueChange={(val) => updateFormData({ multipleEntry: val })}
              className="flex items-center gap-6"
              data-testid="radio-multiple-entry"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="multi-entry-yes" data-testid="radio-multi-entry-yes" />
                <Label htmlFor="multi-entry-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="multi-entry-no" data-testid="radio-multi-entry-no" />
                <Label htmlFor="multi-entry-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          <p className="text-sm mb-2">How long does the applicant plan to stay in Australia?</p>
          {multipleEntry === "yes" && (
            <p className="text-sm mb-3 text-muted-foreground">Note: If the applicant intends to enter Australia more than once, select the longest period they plan to stay in Australia on a single visit.</p>
          )}

          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">Length of stay in Australia</Label>
              <div className="col-span-2">
                <Select value={(formData.lengthOfStay as string) || ""} onValueChange={(val) => updateFormData({ lengthOfStay: val })}>
                  <SelectTrigger data-testid="select-length-of-stay">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {LENGTH_OF_STAY_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">Planned arrival date</Label>
              <div className="col-span-2">
                <Input type="date" value={(formData.plannedArrivalDate as string) || ""} onChange={(e) => updateFormData({ plannedArrivalDate: e.target.value })} className="w-48" data-testid="input-arrival-date" />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">Planned final departure date</Label>
              <div className="col-span-2">
                <Input type="date" value={(formData.plannedDepartureDate as string) || ""} onChange={(e) => updateFormData({ plannedDepartureDate: e.target.value })} className="w-48" data-testid="input-departure-date" />
              </div>
            </div>
          </div>

          <p className="text-sm mb-4">Note: If granted, the stay period may be less than the period requested. The applicant should check the Grant Notification Letter to confirm their period of stay in Australia.</p>

          {multipleEntry === "yes" && (
            <>
              <p className="text-sm mb-2">Does the applicant know the dates of entry for each occasion after first entry to Australia?</p>
              <div className="flex justify-center mb-4">
                <RadioGroup
                  value={knowsEntryDates || ""}
                  onValueChange={(val) => updateFormData({ knowsEntryDates: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-knows-entry-dates"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="knows-dates-yes" data-testid="radio-knows-dates-yes" />
                    <Label htmlFor="knows-dates-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="knows-dates-no" data-testid="radio-knows-dates-no" />
                    <Label htmlFor="knows-dates-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {knowsEntryDates === "yes" && (
                <div className="border rounded-md p-4">
                  <button type="button" className="text-sm text-primary underline mb-3 cursor-pointer" onClick={() => { resetEntryForm(); setEntryFormOpen(true); }} data-testid="link-add-entry">Add details</button>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-primary text-primary-foreground">
                          <th className="text-left p-2 font-medium">Date from</th>
                          <th className="text-left p-2 font-medium">Date to</th>
                          <th className="text-left p-2 font-medium">Give reason</th>
                          <th className="text-left p-2 font-medium">Actions <Tooltip><TooltipTrigger asChild><HelpCircle className="h-3 w-3 inline text-primary-foreground/70" /></TooltipTrigger><TooltipContent><p>Edit or delete entry details</p></TooltipContent></Tooltip></th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.length === 0 ? (
                          <tr><td colSpan={4} className="p-2"><Button variant="outline" size="sm" type="button" onClick={() => { resetEntryForm(); setEntryFormOpen(true); }} data-testid="button-add-entry">Add</Button></td></tr>
                        ) : (
                          <>
                            {entries.map((e, i) => (
                              <tr key={i} className="border-b">
                                <td className="p-2" data-testid={`text-entry-from-${i}`}>{formatDate(e.dateFrom)}</td>
                                <td className="p-2" data-testid={`text-entry-to-${i}`}>{formatDate(e.dateTo)}</td>
                                <td className="p-2" data-testid={`text-entry-reason-${i}`}>{e.reason}</td>
                                <td className="p-2">
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" type="button" onClick={() => editEntry(i)} data-testid={`button-edit-entry-${i}`}>Edit</Button>
                                    <Button variant="outline" size="sm" type="button" onClick={() => removeEntry(i)} data-testid={`button-delete-entry-${i}`}>Delete</Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            <tr><td colSpan={4} className="p-2"><Button variant="outline" size="sm" type="button" onClick={() => { resetEntryForm(); setEntryFormOpen(true); }} data-testid="button-add-more-entry">Add</Button></td></tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-1 mb-4">
            <h3 className="text-base font-bold text-primary">Study while in Australia</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs"><p>Details about any study the applicant plans to undertake while in Australia</p></TooltipContent>
            </Tooltip>
          </div>

          <p className="text-sm mb-2">Will the applicant undertake a course of study in Australia?</p>
          <div className="flex justify-center mb-4">
            <RadioGroup
              value={willStudy || ""}
              onValueChange={(val) => updateFormData({ willStudy: val })}
              className="flex items-center gap-6"
              data-testid="radio-will-study"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="study-yes" data-testid="radio-study-yes" />
                <Label htmlFor="study-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="study-no" data-testid="radio-study-no" />
                <Label htmlFor="study-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {willStudy === "yes" && (
            <>
              <p className="text-sm mb-3">Note: Visitor visa permits the visa holder to study only for a maximum period of 3 months.</p>
              <div className="border rounded-md p-4">
                <button type="button" className="text-sm text-primary underline mb-3 cursor-pointer" onClick={() => { resetStudyForm(); setStudyFormOpen(true); }} data-testid="link-add-study">Add details</button>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-primary text-primary-foreground">
                        <th className="text-left p-2 font-medium">Course name</th>
                        <th className="text-left p-2 font-medium">Institution name</th>
                        <th className="text-left p-2 font-medium">Date from</th>
                        <th className="text-left p-2 font-medium">Date to</th>
                        <th className="text-left p-2 font-medium">Actions <Tooltip><TooltipTrigger asChild><HelpCircle className="h-3 w-3 inline text-primary-foreground/70" /></TooltipTrigger><TooltipContent><p>Edit or delete study details</p></TooltipContent></Tooltip></th>
                      </tr>
                    </thead>
                    <tbody>
                      {studies.length === 0 ? (
                        <tr><td colSpan={5} className="p-2"><Button variant="outline" size="sm" type="button" onClick={() => { resetStudyForm(); setStudyFormOpen(true); }} data-testid="button-add-study">Add</Button></td></tr>
                      ) : (
                        <>
                          {studies.map((s, i) => (
                            <tr key={i} className="border-b">
                              <td className="p-2" data-testid={`text-study-course-${i}`}>{s.courseName}</td>
                              <td className="p-2" data-testid={`text-study-institution-${i}`}>{s.institution}</td>
                              <td className="p-2" data-testid={`text-study-from-${i}`}>{formatDate(s.dateFrom)}</td>
                              <td className="p-2" data-testid={`text-study-to-${i}`}>{formatDate(s.dateTo)}</td>
                              <td className="p-2">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" type="button" onClick={() => editStudy(i)} data-testid={`button-edit-study-${i}`}>Edit</Button>
                                  <Button variant="outline" size="sm" type="button" onClick={() => removeStudy(i)} data-testid={`button-delete-study-${i}`}>Delete</Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          <tr><td colSpan={5} className="p-2"><Button variant="outline" size="sm" type="button" onClick={() => { resetStudyForm(); setStudyFormOpen(true); }} data-testid="button-add-more-study">Add</Button></td></tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-bold text-primary mb-4">Relatives, friends or contacts in Australia</h3>

          <p className="text-sm mb-2">Will the applicant visit any relatives, friends or contacts while in Australia?</p>
          <div className="flex justify-center mb-4">
            <RadioGroup
              value={hasAustraliaContacts || ""}
              onValueChange={(val) => updateFormData({ hasAustraliaContacts: val })}
              className="flex items-center gap-6"
              data-testid="radio-australia-contacts"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="contacts-yes" data-testid="radio-contacts-yes" />
                <Label htmlFor="contacts-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="contacts-no" data-testid="radio-contacts-no" />
                <Label htmlFor="contacts-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {hasAustraliaContacts === "yes" && (
            <div className="border rounded-md p-4">
              <button type="button" className="text-sm text-primary underline mb-3 cursor-pointer" onClick={() => { resetContactForm(); setContactFormOpen(true); }} data-testid="link-add-contact">Add details</button>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="text-left p-2 font-medium">Family name</th>
                      <th className="text-left p-2 font-medium">Given names</th>
                      <th className="text-left p-2 font-medium">Date of birth</th>
                      <th className="text-left p-2 font-medium">Relationship</th>
                      <th className="text-left p-2 font-medium">Actions <Tooltip><TooltipTrigger asChild><HelpCircle className="h-3 w-3 inline text-primary-foreground/70" /></TooltipTrigger><TooltipContent><p>Edit or delete contact details</p></TooltipContent></Tooltip></th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr><td colSpan={5} className="p-2"><Button variant="outline" size="sm" type="button" onClick={() => { resetContactForm(); setContactFormOpen(true); }} data-testid="button-add-contact">Add</Button></td></tr>
                    ) : (
                      <>
                        {contacts.map((c, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-2" data-testid={`text-contact-family-${i}`}>{c.familyName}</td>
                            <td className="p-2" data-testid={`text-contact-given-${i}`}>{c.givenNames}</td>
                            <td className="p-2" data-testid={`text-contact-dob-${i}`}>{formatDate(c.dob)}</td>
                            <td className="p-2" data-testid={`text-contact-relationship-${i}`}>{c.relationship}</td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" type="button" onClick={() => editContact(i)} data-testid={`button-edit-contact-${i}`}>Edit</Button>
                                <Button variant="outline" size="sm" type="button" onClick={() => removeContact(i)} data-testid={`button-delete-contact-${i}`}>Delete</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr><td colSpan={5} className="p-2"><Button variant="outline" size="sm" type="button" onClick={() => { resetContactForm(); setContactFormOpen(true); }} data-testid="button-add-more-contact">Add</Button></td></tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Step11OverseasEmployment({ formData, updateFormData }: StepProps) {
  const EMPLOYMENT_STATUS_OPTIONS = [
    "Employed", "Self employed", "Unemployed", "Retired", "Student", "Other"
  ];

  const OCCUPATION_GROUPING_OPTIONS = [
    "Managers", "Professionals", "Technicians and Trades Workers",
    "Community and Personal Service Workers", "Clerical and Administrative Workers",
    "Sales Workers", "Machinery Operators and Drivers", "Labourers"
  ];

  const AUSTRALIAN_STATES = [
    "Australian Capital Territory", "New South Wales", "Northern Territory",
    "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia"
  ];

  const empStatus = (formData.employmentStatus as string) || "";
  const orgCountry = (formData.empOrgCountry as string) || "";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-primary mb-4" data-testid="text-step11-title">Visa applicant's current overseas employment</h2>

          <h3 className="text-base font-bold text-primary mb-3">Current employment details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">Employment status</Label>
              <div className="col-span-2">
                <Select value={empStatus} onValueChange={(val) => updateFormData({ employmentStatus: val })}>
                  <SelectTrigger data-testid="select-employment-status">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(empStatus === "Employed" || empStatus === "Self employed") && (
              <>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Occupation grouping</Label>
                  <div className="col-span-2">
                    <Select value={(formData.empOccupationGrouping as string) || ""} onValueChange={(val) => updateFormData({ empOccupationGrouping: val })}>
                      <SelectTrigger data-testid="select-occupation-grouping">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {OCCUPATION_GROUPING_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Organisation</Label>
                  <div className="col-span-2">
                    <Input value={(formData.empOrganisation as string) || ""} onChange={(e) => updateFormData({ empOrganisation: e.target.value })} data-testid="input-organisation" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Start date with current employer</Label>
                  <div className="col-span-2">
                    <Input type="date" value={(formData.empStartDate as string) || ""} onChange={(e) => updateFormData({ empStartDate: e.target.value })} data-testid="input-emp-start-date" />
                  </div>
                </div>
              </>
            )}
          </div>

          {(empStatus === "Employed" || empStatus === "Self employed") && (
            <>
              <h3 className="text-base font-bold text-primary mt-6 mb-2">Organisation address</h3>
              <p className="text-sm text-muted-foreground mb-3">Note that a street address is required. A post office address cannot be accepted as an organisation address.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Country</Label>
                  <div className="col-span-2">
                    <Select value={orgCountry} onValueChange={(val) => updateFormData({ empOrgCountry: val })}>
                      <SelectTrigger data-testid="select-org-country">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Address</Label>
                  <div className="col-span-2 space-y-2">
                    <Input value={(formData.empOrgAddress1 as string) || ""} onChange={(e) => updateFormData({ empOrgAddress1: e.target.value })} data-testid="input-org-address1" />
                    <Input value={(formData.empOrgAddress2 as string) || ""} onChange={(e) => updateFormData({ empOrgAddress2: e.target.value })} data-testid="input-org-address2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Suburb / Town</Label>
                  <div className="col-span-2">
                    <Input value={(formData.empOrgSuburb as string) || ""} onChange={(e) => updateFormData({ empOrgSuburb: e.target.value })} data-testid="input-org-suburb" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">{orgCountry === "Australia" ? "State or Territory" : "State or Province"}</Label>
                  <div className="col-span-2">
                    {orgCountry === "Australia" ? (
                      <Select value={(formData.empOrgState as string) || ""} onValueChange={(val) => updateFormData({ empOrgState: val })}>
                        <SelectTrigger data-testid="select-org-state">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          {AUSTRALIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={(formData.empOrgState as string) || ""} onChange={(e) => updateFormData({ empOrgState: e.target.value })} data-testid="input-org-state" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Postal code</Label>
                  <div className="col-span-2">
                    <Input value={(formData.empOrgPostalCode as string) || ""} onChange={(e) => updateFormData({ empOrgPostalCode: e.target.value })} className="max-w-[200px]" data-testid="input-org-postal-code" />
                  </div>
                </div>
              </div>
            </>
          )}

          {empStatus === "Employed" && (
            <>
              <h3 className="text-base font-bold text-primary mt-6 mb-2">Contact person details</h3>
              <p className="text-sm text-muted-foreground mb-3">Give details of the contact person within the organisation.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Family name</Label>
                  <div className="col-span-2">
                    <Input value={(formData.empContactFamilyName as string) || ""} onChange={(e) => updateFormData({ empContactFamilyName: e.target.value })} data-testid="input-contact-family-name" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Given names</Label>
                  <div className="col-span-2">
                    <Input value={(formData.empContactGivenNames as string) || ""} onChange={(e) => updateFormData({ empContactGivenNames: e.target.value })} data-testid="input-contact-given-names" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Position</Label>
                  <div className="col-span-2">
                    <Input value={(formData.empContactPosition as string) || ""} onChange={(e) => updateFormData({ empContactPosition: e.target.value })} data-testid="input-contact-position" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Enter numbers only with no spaces.</p>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Business phone</Label>
                  <div className="col-span-2">
                    <Input value={(formData.empContactBusinessPhone as string) || ""} onChange={(e) => updateFormData({ empContactBusinessPhone: e.target.value })} data-testid="input-contact-business-phone" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Mobile / Cell phone</Label>
                  <div className="col-span-2">
                    <Input value={(formData.empContactMobilePhone as string) || ""} onChange={(e) => updateFormData({ empContactMobilePhone: e.target.value })} data-testid="input-contact-mobile-phone" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground"><strong>Note:</strong> Provide a current phone number for the applicant's employer including country and area codes. The department may use the contact number provided to verify their employment.</p>
              </div>

              <h3 className="text-base font-bold text-primary mt-6 mb-2">Electronic communication</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Email address</Label>
                  <div className="col-span-2">
                    <Input type="email" value={(formData.empContactEmail as string) || ""} onChange={(e) => updateFormData({ empContactEmail: e.target.value })} data-testid="input-contact-email" />
                  </div>
                </div>
              </div>
            </>
          )}

          {empStatus === "Unemployed" && (
            <>
              <h3 className="text-base font-bold text-primary mt-6 mb-2">Unemployment</h3>
              <p className="text-sm text-muted-foreground mb-3">Give details of the length of unemployment and the last employment position held.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Date from</Label>
                  <div className="col-span-2">
                    <Input type="date" value={(formData.empUnemploymentDateFrom as string) || ""} onChange={(e) => updateFormData({ empUnemploymentDateFrom: e.target.value })} data-testid="input-unemployment-date-from" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Last employment position</Label>
                  <div className="col-span-2">
                    <Input value={(formData.empLastPosition as string) || ""} onChange={(e) => updateFormData({ empLastPosition: e.target.value })} data-testid="input-last-position" />
                  </div>
                </div>
              </div>
            </>
          )}

          {empStatus === "Retired" && (
            <>
              <h3 className="text-base font-bold text-primary mt-6 mb-2">Retirement</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Retirement date</Label>
                  <div className="col-span-2">
                    <Input type="date" value={(formData.empRetirementDate as string) || ""} onChange={(e) => updateFormData({ empRetirementDate: e.target.value })} data-testid="input-retirement-date" />
                  </div>
                </div>
              </div>
            </>
          )}

          {empStatus === "Student" && (
            <>
              <h3 className="text-base font-bold text-primary mt-6 mb-2">Student course details</h3>
              <p className="text-sm text-muted-foreground mb-3">Give details of the course the applicant is undertaking.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Course name</Label>
                  <div className="col-span-2">
                    <Input value={(formData.empCourseName as string) || ""} onChange={(e) => updateFormData({ empCourseName: e.target.value })} data-testid="input-course-name" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Institution name</Label>
                  <div className="col-span-2">
                    <Input value={(formData.empInstitutionName as string) || ""} onChange={(e) => updateFormData({ empInstitutionName: e.target.value })} data-testid="input-institution-name" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Date from</Label>
                  <div className="col-span-2">
                    <Input type="date" value={(formData.empCourseDateFrom as string) || ""} onChange={(e) => updateFormData({ empCourseDateFrom: e.target.value })} data-testid="input-course-date-from" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm">Date to</Label>
                  <div className="col-span-2">
                    <Input type="date" value={(formData.empCourseDateTo as string) || ""} onChange={(e) => updateFormData({ empCourseDateTo: e.target.value })} data-testid="input-course-date-to" />
                  </div>
                </div>
              </div>
            </>
          )}

          {empStatus === "Other" && (
            <>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-3 items-start gap-4">
                  <Label className="text-sm pt-2">Give details</Label>
                  <div className="col-span-2">
                    <Textarea value={(formData.empOtherDetails as string) || ""} onChange={(e) => updateFormData({ empOtherDetails: e.target.value })} rows={5} data-testid="textarea-other-details" />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Step12FinancialSupport({ formData, updateFormData }: StepProps) {
  const fundingSource = (formData.fundingSource as string) || "";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-primary mb-4" data-testid="text-step12-title">Financial support</h2>

          <h3 className="text-base font-bold text-primary mb-3">Funding details</h3>
          <p className="text-sm text-muted-foreground mb-3">Give details of how the applicant's stay in Australia will be funded</p>
          <div className="space-y-2 ml-4 mb-4">
            {["Self funded", "Supported by current overseas employer", "Supported by other organisation", "Supported by other person"].map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="fundingSource"
                  value={option}
                  checked={fundingSource === option}
                  onChange={(e) => updateFormData({ fundingSource: e.target.value })}
                  className="h-4 w-4"
                  data-testid={`radio-funding-${option.toLowerCase().replace(/\s+/g, "-")}`}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>

          {fundingSource === "Self funded" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-start gap-4">
                <Label className="text-sm pt-2">What funds will the applicant have available to support their stay in Australia?</Label>
                <div className="col-span-2">
                  <Textarea value={(formData.selfFundedDetails as string) || ""} onChange={(e) => updateFormData({ selfFundedDetails: e.target.value })} rows={5} data-testid="textarea-self-funded-details" />
                </div>
              </div>
            </div>
          )}

          {fundingSource === "Supported by current overseas employer" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Type of support</Label>
                <div className="col-span-2">
                  <Select value={(formData.employerSupportType as string) || ""} onValueChange={(val) => updateFormData({ employerSupportType: val })}>
                    <SelectTrigger data-testid="select-employer-support-type">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Accommodation">Accommodation</SelectItem>
                      <SelectItem value="All costs">All costs</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 items-start gap-4">
                <Label className="text-sm pt-2">What funds will the applicant have available to support their stay in Australia?</Label>
                <div className="col-span-2">
                  <Textarea value={(formData.employerFundedDetails as string) || ""} onChange={(e) => updateFormData({ employerFundedDetails: e.target.value })} rows={5} data-testid="textarea-employer-funded-details" />
                </div>
              </div>
            </div>
          )}

          {fundingSource === "Supported by other organisation" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Type of support</Label>
                <div className="col-span-2">
                  <Select value={(formData.orgSupportType as string) || ""} onValueChange={(val) => updateFormData({ orgSupportType: val })}>
                    <SelectTrigger data-testid="select-org-support-type">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Accommodation">Accommodation</SelectItem>
                      <SelectItem value="All costs">All costs</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 items-start gap-4">
                <Label className="text-sm pt-2">What funds will the applicant have available to support their stay in Australia?</Label>
                <div className="col-span-2">
                  <Textarea value={(formData.orgFundedDetails as string) || ""} onChange={(e) => updateFormData({ orgFundedDetails: e.target.value })} rows={5} data-testid="textarea-org-funded-details" />
                </div>
              </div>

              <h3 className="text-base font-bold text-primary mt-6 mb-2">Organisation address</h3>
              <p className="text-sm text-muted-foreground mb-3">Note that a street address is required. A post office address cannot be accepted as an organisation address.</p>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Country</Label>
                <div className="col-span-2">
                  <Select value={(formData.fundingOrgCountry as string) || ""} onValueChange={(val) => updateFormData({ fundingOrgCountry: val })}>
                    <SelectTrigger data-testid="select-funding-org-country">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Address</Label>
                <div className="col-span-2 space-y-2">
                  <Input value={(formData.fundingOrgAddress1 as string) || ""} onChange={(e) => updateFormData({ fundingOrgAddress1: e.target.value })} data-testid="input-funding-org-address1" />
                  <Input value={(formData.fundingOrgAddress2 as string) || ""} onChange={(e) => updateFormData({ fundingOrgAddress2: e.target.value })} data-testid="input-funding-org-address2" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Suburb / Town</Label>
                <div className="col-span-2">
                  <Input value={(formData.fundingOrgSuburb as string) || ""} onChange={(e) => updateFormData({ fundingOrgSuburb: e.target.value })} data-testid="input-funding-org-suburb" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">{(formData.fundingOrgCountry as string) === "Australia" ? "State or Territory" : "State or Province"}</Label>
                <div className="col-span-2">
                  {(formData.fundingOrgCountry as string) === "Australia" ? (
                    <Select value={(formData.fundingOrgState as string) || ""} onValueChange={(val) => updateFormData({ fundingOrgState: val })}>
                      <SelectTrigger data-testid="select-funding-org-state">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={(formData.fundingOrgState as string) || ""} onChange={(e) => updateFormData({ fundingOrgState: e.target.value })} data-testid="input-funding-org-state" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Postal code</Label>
                <div className="col-span-2">
                  <Input value={(formData.fundingOrgPostalCode as string) || ""} onChange={(e) => updateFormData({ fundingOrgPostalCode: e.target.value })} className="max-w-[200px]" data-testid="input-funding-org-postal-code" />
                </div>
              </div>
            </div>
          )}

          {fundingSource === "Supported by other person" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Type of support</Label>
                <div className="col-span-2">
                  <Select value={(formData.personSupportType as string) || ""} onValueChange={(val) => updateFormData({ personSupportType: val })}>
                    <SelectTrigger data-testid="select-person-support-type">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Accommodation">Accommodation</SelectItem>
                      <SelectItem value="All costs">All costs</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 items-start gap-4">
                <Label className="text-sm pt-2">What funds will the applicant have available to support their stay in Australia?</Label>
                <div className="col-span-2">
                  <Textarea value={(formData.personFundedDetails as string) || ""} onChange={(e) => updateFormData({ personFundedDetails: e.target.value })} rows={5} data-testid="textarea-person-funded-details" />
                </div>
              </div>

              <h3 className="text-base font-bold text-primary mt-6 mb-2">Relationship to applicant</h3>
              <p className="text-sm text-muted-foreground mb-3">Give details of the person that will provide support to the applicant.</p>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Relationship to the applicant</Label>
                <div className="col-span-2">
                  <Select value={(formData.personRelationship as string) || ""} onValueChange={(val) => updateFormData({ personRelationship: val })}>
                    <SelectTrigger data-testid="select-person-relationship">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Aunt", "Brother", "Business associate", "Child", "Cousin", "Daughter",
                        "Son in law", "Fiance/ fiancee", "Friend", "Grandchild", "Grandparent",
                        "Mother/Father in law", "Nephew", "Niece", "Parent", "Sister",
                        "Sister/Brother in law", "Spouse / De facto partner", "Step child",
                        "Step parent", "Step brother", "Step sister", "Uncle"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Family name</Label>
                <div className="col-span-2">
                  <Input value={(formData.personFamilyName as string) || ""} onChange={(e) => updateFormData({ personFamilyName: e.target.value })} data-testid="input-person-family-name" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Given names</Label>
                <div className="col-span-2">
                  <Input value={(formData.personGivenNames as string) || ""} onChange={(e) => updateFormData({ personGivenNames: e.target.value })} data-testid="input-person-given-names" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Country</Label>
                <div className="col-span-2">
                  <Select value={(formData.personCountry as string) || ""} onValueChange={(val) => updateFormData({ personCountry: val })}>
                    <SelectTrigger data-testid="select-person-country">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Address</Label>
                <div className="col-span-2 space-y-2">
                  <Input value={(formData.personAddress1 as string) || ""} onChange={(e) => updateFormData({ personAddress1: e.target.value })} data-testid="input-person-address1" />
                  <Input value={(formData.personAddress2 as string) || ""} onChange={(e) => updateFormData({ personAddress2: e.target.value })} data-testid="input-person-address2" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Suburb / Town</Label>
                <div className="col-span-2">
                  <Input value={(formData.personSuburb as string) || ""} onChange={(e) => updateFormData({ personSuburb: e.target.value })} data-testid="input-person-suburb" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">{(formData.personCountry as string) === "Australia" ? "State or Territory" : "State or Province"}</Label>
                <div className="col-span-2">
                  {(formData.personCountry as string) === "Australia" ? (
                    <Select value={(formData.personState as string) || ""} onValueChange={(val) => updateFormData({ personState: val })}>
                      <SelectTrigger data-testid="select-person-state">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={(formData.personState as string) || ""} onChange={(e) => updateFormData({ personState: e.target.value })} data-testid="input-person-state" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-sm">Postal code</Label>
                <div className="col-span-2">
                  <Input value={(formData.personPostalCode as string) || ""} onChange={(e) => updateFormData({ personPostalCode: e.target.value })} className="max-w-[200px]" data-testid="input-person-postal-code" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
    if (Object.keys(validationErrors).length > 0) {
      const clearedErrors = { ...validationErrors };
      Object.keys(updates).forEach((key) => {
        delete clearedErrors[key];
      });
      setValidationErrors(clearedErrors);
    }
  }, [validationErrors]);

  const handleSave = useCallback(() => {
    saveMutation.mutate({ formData, currentStep });
    toast({ title: "Saved", description: "Your progress has been saved." });
  }, [formData, currentStep, saveMutation, toast]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      let newStep = currentStep - 1;
      if (newStep === 10) newStep = 9;
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

  const validateStep3 = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!formData.familyName || !(formData.familyName as string).trim()) {
      errors.familyName = "Family name is a required field.";
    }
    if (!formData.sex) {
      errors.sex = "Sex is a required field.";
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is a required field.";
    }
    if (!formData.passportNumber || !(formData.passportNumber as string).trim()) {
      errors.passportNumber = "Passport number is a required field.";
    }
    if (!formData.countryOfPassport) {
      errors.countryOfPassport = "Country of passport is a required field.";
    }
    if (!formData.nationalityOfHolder) {
      errors.nationalityOfHolder = "Nationality of passport holder is a required field.";
    }
    if (!formData.dateOfIssue) {
      errors.dateOfIssue = "Date of issue is a required field.";
    }
    if (!formData.dateOfExpiry) {
      errors.dateOfExpiry = "Date of expiry is a required field.";
    }
    if (!formData.placeOfIssue || !(formData.placeOfIssue as string).trim()) {
      errors.placeOfIssue = "Place of issue / issuing authority is a required field.";
    }
    if (!formData.hasNationalIdCard) {
      errors.hasNationalIdCard = "National identity card is a required field.";
    }
    if (formData.hasNationalIdCard === "yes") {
      const cards = (formData.nationalIdCards as Array<Record<string, string>>) || [];
      if (cards.length === 0) {
        errors.nationalIdCards = "Please add at least one national identity card.";
      }
    }
    if (!formData.isPacificAustraliaCardHolder) {
      errors.isPacificAustraliaCardHolder = "Pacific Australia Travel Card holder is a required field.";
    }
    if (formData.isPacificAustraliaCardHolder === "yes" && (!formData.pacificAustraliaCardSerial || !(formData.pacificAustraliaCardSerial as string).trim())) {
      errors.pacificAustraliaCardSerial = "Card serial number is a required field.";
    }
    if (!formData.birthCountry) {
      errors.birthCountry = "Country of birth is a required field.";
    }
    if (!formData.relationshipStatus) {
      errors.relationshipStatus = "Relationship status is a required field.";
    }
    if (!formData.hasOtherNames) {
      errors.hasOtherNames = "Other names / spellings is a required field.";
    }
    if (!formData.citizenOfPassportCountry) {
      errors.citizenOfPassportCountry = "Citizen of passport country is a required field.";
    }
    if (!formData.citizenOfOtherCountry) {
      errors.citizenOfOtherCountry = "Citizen of any other country is a required field.";
    }
    if (!formData.previouslyTravelledToAustralia) {
      errors.previouslyTravelledToAustralia = "Previously travelled to Australia is a required field.";
    }
    if (!formData.previouslyAppliedForVisa) {
      errors.previouslyAppliedForVisa = "Previously applied for a visa is a required field.";
    }
    if (!formData.hasGrantNumber) {
      errors.hasGrantNumber = "Grant number is a required field.";
    }
    if (formData.hasGrantNumber === "yes" && (!formData.visaGrantNumber || !(formData.visaGrantNumber as string).trim())) {
      errors.visaGrantNumber = "Visa grant number is a required field.";
    }
    if (!formData.hasOtherPassports) {
      errors.hasOtherPassports = "Other passports / travel documents is a required field.";
    }
    if (!formData.hasOtherIdentityDocs) {
      errors.hasOtherIdentityDocs = "Other identity documents is a required field.";
    }
    if (!formData.hasHealthExamination) {
      errors.hasHealthExamination = "Health examination is a required field.";
    }
    if (formData.hasHealthExamination === "yes" && (!formData.healthExaminationDetails || !(formData.healthExaminationDetails as string).trim())) {
      errors.healthExaminationDetails = "Health examination details are required.";
    }
    return errors;
  }, [formData]);

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

    if (currentStep === 3) {
      const errors = validateStep3();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast({
          title: "Required fields missing",
          description: "Please complete all required fields before proceeding.",
          variant: "destructive",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setValidationErrors({});
    }

    if (currentStep === 4) {
      if (!formData.criticalDataConfirmed) {
        toast({
          title: "Confirmation required",
          description: "Please confirm whether the above information is correct.",
          variant: "destructive",
        });
        return;
      }
      if (formData.criticalDataConfirmed === "no") {
        return;
      }
    }

    if (currentStep === 5) {
      if (!formData.hasTravellingCompanions) {
        toast({
          title: "Required field",
          description: "Please indicate whether there are other persons travelling with the applicant.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 7) {
      if (!formData.authorisedRecipient) {
        toast({
          title: "Required field",
          description: "Please select whether the applicant authorises another person to receive correspondence.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 8) {
      if (!formData.hasNonAccompanyingMembers) {
        toast({
          title: "Required field",
          description: "Please indicate whether the applicant has non-accompanying family members.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 9) {
      if (!formData.multipleEntry) {
        toast({ title: "Required field", description: "Please indicate whether the applicant intends to enter Australia on more than one occasion.", variant: "destructive" });
        return;
      }
      if (!formData.willStudy) {
        toast({ title: "Required field", description: "Please indicate whether the applicant will undertake a course of study in Australia.", variant: "destructive" });
        return;
      }
      if (!formData.hasAustraliaContacts) {
        toast({ title: "Required field", description: "Please indicate whether the applicant will visit any relatives, friends or contacts in Australia.", variant: "destructive" });
        return;
      }
    }

    if (currentStep === 11) {
      if (!formData.employmentStatus) {
        toast({ title: "Required field", description: "Please select an employment status.", variant: "destructive" });
        return;
      }
    }

    if (currentStep === 12) {
      if (!formData.fundingSource) {
        toast({ title: "Required field", description: "Please select how the applicant's stay will be funded.", variant: "destructive" });
        return;
      }
    }

    let newStep = currentStep + 1;
    if (newStep === 10) newStep = 11;
    saveMutation.mutate(
      { formData, currentStep: newStep },
      {
        onSuccess: () => {
          setCurrentStep(newStep);
          toast({ title: `Step ${currentStep} complete`, description: "Moving to the next step." });
        },
      }
    );
  }, [currentStep, formData, saveMutation, toast, validateStep3]);

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
      case 3:
        return <Step3Applicant formData={formData} updateFormData={updateFormData} validationErrors={validationErrors} />;
      case 4:
        return <Step4CriticalDataConfirmation formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <Step5TravellingCompanions formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <Step6ContactDetails formData={formData} updateFormData={updateFormData} />;
      case 7:
        return <Step7AuthorisedRecipient formData={formData} updateFormData={updateFormData} />;
      case 8:
        return <Step8NonAccompanyingFamily formData={formData} updateFormData={updateFormData} />;
      case 9:
        return <Step9EntryToAustralia formData={formData} updateFormData={updateFormData} />;
      case 11:
        return <Step11OverseasEmployment formData={formData} updateFormData={updateFormData} />;
      case 12:
        return <Step12FinancialSupport formData={formData} updateFormData={updateFormData} />;
      default:
        return (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Development is in process</p>
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
            Transaction Reference Number (TRN): {application.trn}
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
